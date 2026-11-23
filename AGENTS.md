# AGENTS.md

## Rule values

Resolve utility values through the preset's value handlers (`h` from `utils/handlers` in preset-wind4, `_utils/handlers` in preset-mini), chained in priority order, such as `h.bracket.cssvar.number(value, theme)`.

A new unit or keyword belongs in the handler or its regex, so every rule that uses that handler accepts it. For example, bare units such as `px`, `vw`, and `lh` live in `unitOnlyRE` and `unitOnlyMap`.

Add a static rule or a rule-local regex only for a value that belongs to that one utility.
