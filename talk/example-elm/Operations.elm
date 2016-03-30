import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import StartApp.Simple exposing (start)
import Json.Decode as Json
import Signal exposing (Address)
import VirtualDom exposing (Node)
import String exposing (contains)

-- MODEL

-- Type descriptions

type alias Model =
  {
    counter : Int,
    sort: String,
    filter: String,
    operations: List Operation
  }

type alias Operation =
  {
    id: String,
    progress: Float
  }

-- Operations
operations: List Operation
operations =
  [
    {
      id = "foo-abcd-adcd",
      progress = 0.69
    },
    {
      id = "bar-abcd-abcd",
      progress = 0.01
    },
    {
      id = "baz-abcd-abcd",
      progress = 0.02
    }
  ]

-- Sorting operations
idSorter: Operation -> String
idSorter operation =
  operation.id

progressSorter: Operation -> String
progressSorter operation =
  toString operation.progress

sorter sort =
  case sort of
    "id" -> idSorter
    "progress" -> progressSorter
    _ -> idSorter

sortOperations str operations =
  List.sortBy (sorter str) operations

-- Filtering operations
filterer: String -> (Operation -> Bool)
filterer filter =
  if filter == "" then (\_ -> True) else (\operation -> contains filter operation.id)

filterOperations str operations =
  List.filter (filterer str) operations

model : Model
model =
  {
    counter = 0,
    sort = "id",
    filter = "",
    operations = operations
  }


-- UPDATE

type Action =
  Filter String |
  Sort String

update : Action -> Model -> Model
update action model =
  case action of
    Filter str -> { model | filter = str }
    Sort str -> { model | sort = str }

onInput : Signal.Address Action -> (String -> Action) -> Attribute
onInput address actionFromString =
    on "input" targetValue (\str -> Signal.message address (actionFromString str))

-- VIEW

-- Method to include css into your view
-- (a bit hacky, found on Google Groups discussions - https://groups.google.com/forum/#!topic/elm-discuss/HQwB2DXjXRc)
css : String -> Html
css path =
  node "link" [ rel "stylesheet", href path ] []

-- Creates correct sort icon depending on the current sort value
sortIcon : Model -> String -> String
sortIcon model currentName =
  if model.sort == currentName then "fa fa-sort-asc" else "fa fa-sort"

createRow : Operation -> VirtualDom.Node
createRow operation =
  tr [] [
    td [] [ text operation.id],
    td [] [ text (toString operation.progress) ]
  ]

operationsToRows : List Operation -> List VirtualDom.Node
operationsToRows operations =
  List.map createRow operations

view : Signal.Address Action -> Model -> Html
view address model =
  div []
    [
      -- button [ onClick address Decrement ] [ text "-" ],
      div [ countStyle ] [ text (toString model.counter) ],
      -- button [ onClick address Increment ] [ text "+" ],
      css "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css",
      css "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css",

      div [ class "container" ] [
        h1 [] [ text "Operations" ],
        div [ class "row", operationsFilterStyle ] [
          div [ class "col-sm-6"] [
            input [
              onInput address Filter,
              type' "text",
              placeholder "Filter",
              class "filter form-control",
              value model.filter
            ] []
          ]
        ],
        div [ class "row" ] [
          div [ class "col-sm-12"] [
            table [ class "operations table table-bordered table-striped" ] [
              thead [] [
                tr [] [
                  th [] [ text "Id", i [ class (sortIcon model "id"), operationsSortStyle ] [] ],
                  th [] [ text "Progress", i [ class (sortIcon model "progress"), operationsSortStyle ] []]
                ]
              ],
              tbody [] (operationsToRows
                (sortOperations model.sort (filterOperations model.filter model.operations))
              )
            ]
          ]
        ]
      ]
    ]

operationsFilterStyle : Attribute
operationsFilterStyle =
  style
    [ ("margin-bottom", "10px") ]

operationsSortStyle : Attribute
operationsSortStyle =
  style
    [ ("margin-left", "10px") ]


countStyle : Attribute
countStyle =
  style
    [ ("font-size", "20px")
    , ("font-family", "monospace")
    , ("display", "inline-block")
    , ("width", "50px")
    , ("text-align", "center")
    ]


main =
  StartApp.Simple.start
    {
      model = model,
      update = update,
      view = view
    }
