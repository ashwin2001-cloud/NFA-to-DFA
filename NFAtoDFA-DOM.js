class UserInput {
  constructor(initialState, finalStates, states, alphabet, transitions) {
    this.initialState = initialState;
    this.finalStates = finalStates;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
  }
}
$(document).ready(function () {
  $("#new-transition").click(function () {
    //where transition rows are entered
    let transitionsDiv = $("#nfa-transitions");

    //production-row is inside nfa-transitions
    let clone = $("#nfa-transitions .production-row").last().clone(true);
    clone.appendTo(transitionsDiv);

    $(".remove-button").show();
  });

  let removeButton = $(".remove-button");

  // Hide all remove buttons initially
  // removeButton.hide();
  // Register onClick() event for remove buttons
  removeButton.click(function () {
    let parent = $(this).parent();
    let grandparent = parent.parent();

    parent.fadeOut(function () {
      $(this).remove();
    });

    if (grandparent.children().length <= 2) {
      $(".remove-button").hide();
    }
  });

  //keypress->
  $(".production-row input").on("keypress", function (e) {
    //e.which=13 means on pressing enter
    if (e.which === 13) {
      $("#new-transition").click();
    }
  });

  //After giving a 1.)new transition, 2.)initial state, 3.)final state, "#verify-update-debug" is clicked and dfa is updated
  //1.) keyup-> user releases key
  $(".production-row input").on("keyup", function (e) {
    if (e.which !== 13) {
      $("#verify-update-debug").click();
    }
  });

  //2.) 
  $("#initialStateInput").on("keyup", function (e) {
    $("#verify-update-debug").click();
  });

  //3.)
  $("#finalStatesInput").on("keyup", function (e) {
    $("#verify-update-debug").click();
  });

  // bookmark
  $("#exampleBtn").click(function () {
    $("#initialStateInput").val("q0");
    $("#finalStatesInput").val("q1");

    //where transition rows are stored
    let transitionsDiv = $("#nfa-transitions");
    //clone(true) duplicates $("#nfa-transitions .production-row").first() and stores it in let clone
    let clone = $("#nfa-transitions .production-row").first().clone(true);

    //removing all initial children
    transitionsDiv.children().each(function () {
      $(this).remove();
    });

    clone.find(".current-state-input").val("q0");
    clone.find(".input-symbol").val("a");
    clone.find(".next-states").val("q1");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q0");
    clone.find(".input-symbol").val("b");
    clone.find(".next-states").val("q1");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q1");
    clone.find(".input-symbol").val("a");
    clone.find(".next-states").val("q0");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q1");
    clone.find(".input-symbol").val("b");
    clone.find(".next-states").val("q1");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q1");
    clone.find(".input-symbol").val("a");
    clone.find(".next-states").val("q2");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q1");
    clone.find(".input-symbol").val("b");
    clone.find(".next-states").val("q2");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q2");
    clone.find(".input-symbol").val("a");
    clone.find(".next-states").val("q2");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q2");
    clone.find(".input-symbol").val("b");
    clone.find(".next-states").val("q1");
    transitionsDiv.append(clone);

    $(".remove-button").show();
    $("#verify-update-debug").click();
  });

  $("#resetBtn").click(function () {
    $("#initialStateInput").val("");
    $("#finalStatesInput").val("");
    $(".remove-button").slice(1).click();
    $(".remove-button").hide();
    $("#nfa-transitions input").val("");
    $("#current-nfa").empty();
    $("#current-dfa").empty();
    $("#current-dfa-minimized").empty();
    $("#step-div").empty();
  });

  $("#verify-update-debug").click(function () {
    console.log('---start---');
    //fetchUserInput is below
    //nfa has been created
    let user_input = fetchUserInput();

    //graphviz used to represent graph structures
    let dotStr = "digraph fsm {\n";
    dotStr += "rankdir=LR;\n";
    dotStr += 'size="8,5";\n';
    dotStr += "node [shape = doublecircle]; " + user_input.finalStates + ";\n";
    dotStr += "node [shape = point]; INITIAL_STATE\n";
    dotStr += "node [shape = circle];\n";
    dotStr += "INITIAL_STATE -> " + user_input.initialState + ";\n";

    for (let transition of user_input.transitions)
      dotStr +=
        "" +
        transition.state +
        " -> " +
        transition.nextStates +
        " [label=" +
        transition.symbol +
        "];\n";

    dotStr += "}";

    //document.getElementById('current-nfa-status').innerText = 'Rendering...';

    // TODO This render method throws an exception if the input is invalid
    // we should catch the exception and print an "invalid input" error to the user
    console.log('######', dotStr);
    //current nfa is printed
    d3.select("#current-nfa").graphviz().zoom(false).renderDot(dotStr);

    // generate the DFA
    let dfa = generateDFA(
      new NFA(
        user_input.initialState,
        user_input.finalStates,
        user_input.states,
        user_input.alphabet,
        user_input.transitions
      )
    );

    dotStr = dfa.toDotString();
    console.log('****', dotStr);
    //current dfa is printed
    d3.select("#current-dfa").graphviz().zoom(false).renderDot(dotStr);

    //minimized dfa
    dfa = minimizeDFA(dfa);
    dotStr = dfa.toDotString();
    console.log(dotStr, '****');
    $("#current-dfa-minimized").show();
    // generate minimized dfa
    d3.select("#current-dfa-minimized")
      .graphviz()
      .zoom(false)
      .renderDot(dotStr);
  });

  function fetchUserInput() {
    let initialState = $("#initialStateInput").val().trim();
    let finalStates = $("#finalStatesInput").val().trim();
    let states = [];
    let alphabet = [];
    let transitions = [];

    if (initialState.includes("{") || finalStates.includes("{")) {
      alert('State names cannot contain the "{" character!');
      return null;
    }

    $(".production-row").each(function () {

      //currentState, inputSymbol, nextState are trimmed
      //currentState-> from where arrow origins
      let currentState = $(this).find(".current-state-input").val().trim();
      let inputSymbol = $(this).find(".input-symbol").val().trim();

      if (inputSymbol === "") inputSymbol = "\u03BB"; //lambda character

      let nextState = $(this).find(".next-states").val().trim();

      // TODO Better state validation?
      if (currentState.includes("{") || nextState.includes("{")) {
        alert('State names cannot contain the "{" character!');
        return;
      }

      //1. adding transitions
      transitions.push(new Transition(currentState, nextState, inputSymbol));

      // Populate alphabet without lambda
      //2. pushing symbols in alphabets
      if (inputSymbol !== "\u03BB" && !alphabet.includes(inputSymbol)){
        alphabet.push(inputSymbol);
        // console.log('****', 1, '****');
      }

      //3a. pushing currentState in states
      if (!states.includes(currentState)){
        states.push(currentState);
        // console.log('****', 2, '****');
      }

      //3b. pushing nextState in states
      if (!states.includes(nextState)){
        states.push(nextState);
        // console.log('****', 3, '****');
      }
    });
    
    //3. pushing finalStates
    if (finalStates.includes(",")) finalStates = finalStates.split(",");

    return new UserInput(
      initialState,
      finalStates,
      states,
      alphabet,
      transitions
    );
  }
});
