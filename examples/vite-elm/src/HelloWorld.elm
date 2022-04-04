module HelloWorld exposing (helloWorld)

import Html exposing (Html, div, h1, p, a, button, code, text)
import Html.Attributes exposing (href, class)
import Html.Events exposing (onClick)
import Msg exposing (Msg(..))


helloWorld : Int -> Html Msg
helloWorld model =
    div []
        [ h1 [ class "mt-2em animate-bounce-alt animate-2s"] [ text "Hello, Vite + Elm!"]
        , p []
            [ a [ href "https://vitejs.dev/guide/features.html", class "c-#60b5cc"] [ text "Vite Documentation" ]
            , text " | "
            , a [ href "https://guide.elm-lang.org/", class "c-#60b5cc" ] [ text "Elm Documentation" ]
            ]
        , button [ onClick Increment ] [ text ("count is: " ++ String.fromInt model) ]
        , p []
            [ text "Edit "
            , code [] [ text "src/Main.elm" ]
            , text " to test auto refresh"
            ]
        ]
