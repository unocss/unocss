module Main exposing (main)

import Browser
import Html exposing (Html, div, header)
import Html.Attributes exposing (class)
import Html.Events exposing (..)
import Msg exposing (Msg(..))
import HelloWorld exposing (helloWorld)


main : Program () Int Msg
main =
    Browser.sandbox { init = 0, update = update, view = view }


update : Msg -> number -> number
update msg model =
    case msg of
        Increment ->
            model + 1

        Decrement ->
            model - 1


view : Int -> Html Msg
view model =
    div [ class "text-center" ]
        [header [class "bg-white min-h-100vh flex flex-col items-center justify-center" ]
            [ div [ class "logo" ] []
            , helloWorld model
            ]
        ]
