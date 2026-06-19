use zed_extension_api::settings::LspSettings;
use zed_extension_api::{self as zed, LanguageServerId, Result};

const SERVER_NAME: &str = "unocss";
const PACKAGE_NAME: &str = "@unocss/language-server";
const SERVER_PATH: &str = "node_modules/@unocss/language-server/bin/unocss-language-server.js";

struct UnocssExtension {
    did_find_server: bool,
}

impl UnocssExtension {
    fn server_exists(&self) -> bool {
        std::fs::metadata(SERVER_PATH).is_ok_and(|stat| stat.is_file())
    }

    fn server_script_path(&mut self, id: &LanguageServerId) -> Result<String> {
        let server_exists = self.server_exists();
        if self.did_find_server && server_exists {
            return Ok(SERVER_PATH.to_string());
        }

        zed::set_language_server_installation_status(
            id,
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );
        let version = zed::npm_package_latest_version(PACKAGE_NAME)?;

        if !server_exists
            || zed::npm_package_installed_version(PACKAGE_NAME)?.as_deref()
                != Some(version.as_str())
        {
            zed::set_language_server_installation_status(
                id,
                &zed::LanguageServerInstallationStatus::Downloading,
            );
            let result = zed::npm_install_package(PACKAGE_NAME, &version);
            match result {
                Ok(()) => {
                    if !self.server_exists() {
                        return Err(format!(
                            "installed package '{PACKAGE_NAME}' did not contain expected path '{SERVER_PATH}'"
                        ));
                    }
                }
                Err(error) => {
                    // Update failed (e.g. offline) — fall back to any existing server.
                    if !self.server_exists() {
                        return Err(error);
                    }
                }
            }
        }

        self.did_find_server = true;
        Ok(SERVER_PATH.to_string())
    }
}

impl zed::Extension for UnocssExtension {
    fn new() -> Self {
        Self {
            did_find_server: false,
        }
    }

    fn language_server_command(
        &mut self,
        id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        // Honor an explicit `binary` override from settings (e.g. a local build).
        if let Some(binary) = LspSettings::for_worktree(SERVER_NAME, worktree)
            .ok()
            .and_then(|lsp| lsp.binary)
        {
            if let Some(path) = binary.path {
                return Ok(zed::Command {
                    command: path,
                    args: binary.arguments.unwrap_or_default(),
                    env: worktree.shell_env(),
                });
            }
        }

        let server_path = self.server_script_path(id)?;
        // The path is relative to the extension dir, but Zed runs the command
        // with the worktree as cwd — resolve it to an absolute path.
        let server_path = std::env::current_dir()
            .map_err(|e| format!("failed to read extension working directory: {e}"))?
            .join(&server_path)
            .to_string_lossy()
            .to_string();
        Ok(zed::Command {
            command: zed::node_binary_path()?,
            args: vec![server_path, "--stdio".to_string()],
            env: worktree.shell_env(),
        })
    }

    fn language_server_workspace_configuration(
        &mut self,
        _id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<serde_json::Value>> {
        let settings = LspSettings::for_worktree(SERVER_NAME, worktree)
            .ok()
            .and_then(|lsp| lsp.settings)
            .unwrap_or_else(|| serde_json::json!({}));

        // Wrap settings under the `unocss` namespace the server expects, unless
        // the user already nested them there.
        let configuration = if settings.get("unocss").is_some() {
            settings
        } else {
            serde_json::json!({ "unocss": settings })
        };

        Ok(Some(configuration))
    }

    fn language_server_initialization_options(
        &mut self,
        _id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<serde_json::Value>> {
        Ok(LspSettings::for_worktree(SERVER_NAME, worktree)
            .ok()
            .and_then(|lsp| lsp.initialization_options))
    }
}

zed::register_extension!(UnocssExtension);
