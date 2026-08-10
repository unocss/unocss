# UnoCSS Core

UnoCSS Core turns utility tokens into generated CSS.

## Language

**Utility token**:
A source token that UnoCSS can match against rules, variants, shortcuts, and configuration to produce CSS.
_Avoid_: class name, string

**Token processing**:
The interpretation of utility tokens before CSS assembly, including matching and the generation of utility data.
_Avoid_: parsing, token generation

**CSS assembly**:
The ordered construction of generated CSS from processed utility data and preflights.
_Avoid_: rendering, serialization
