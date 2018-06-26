import React, { Component } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

const KEYBOARD_KEYS = {
  esc: 27,
  enter: 13,
  rightArrow: 39,
  leftArrow: 37
};

class App extends Component {
  static getCursorIndex(input) {
    // TODO cleanup
    return input.selectionStart || input.selectionStart === "0"
      ? input.selectionStart
      : 0;
  }

  static getMapping() {
    // TODO toUpperCase()
    return {
      A: ["À", "Â", "Æ"],
      C: ["Ç"],
      E: ["É", "È", "Ë", "Ê"],
      I: ["Î", "Ï"],
      O: ["Ô", "Œ"],
      U: ["Ù", "Û", "Ü"],
      a: ["à", "â", "æ"],
      c: ["ç"],
      e: ["é", "è", "ë", "ê"],
      i: ["î", "ï"],
      o: ["ô", "œ"],
      u: ["ù", "û", "ü"]
    };
  }

  constructor(props) {
    super(props);
    this.showPicker = this.showPicker.bind(this);
    this.ensureCharsEntered = this.ensureCharsEntered.bind(this);
    this.hidePicker = this.hidePicker.bind(this);
    this.insertCharacter = this.insertCharacter.bind(this);
    this.conditionallyHidePicker = this.conditionallyHidePicker.bind(this);
    this.reset = this.reset.bind(this);
    this.timer = null;
    this.myInput = React.createRef();
    this.state = {
      showPicker: false,
      characters: [],
      lastKeypress: undefined,
      buttonFocusIndex: 0
    };
  }

  componentDidMount() {
    document.addEventListener("click", this.hidePicker);
    document.addEventListener("keydown", this.conditionallyHidePicker);
    document.addEventListener("keyup", this.reset);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.hidePicker);
    document.removeEventListener("keydown", this.conditionallyHidePicker);
    document.removeEventListener("keyup", this.reset);
  }

  conditionallyHidePicker(e) {
    if (!this.state.showPicker) return;
    console.log(this.state.buttonFocusIndex);
    if (e.which === KEYBOARD_KEYS.esc) this.setState({ showPicker: false });
    if (
      e.which === KEYBOARD_KEYS.leftArrow &&
      this.state.buttonFocusIndex > 0
    ) {
      this.setState({ buttonFocusIndex: this.state.buttonFocusIndex - 1 });
    }
    if (
      e.which === KEYBOARD_KEYS.rightArrow &&
      this.state.buttonFocusIndex < this.state.characters.length - 1
    ) {
      this.setState({ buttonFocusIndex: this.state.buttonFocusIndex + 1 });
    }
  }

  ensureCharsEntered(e) {
    if (e.target.value.length === 0) {
      this.setState({ showPicker: false });
    }
  }

  hidePicker(e) {
    if (e.target !== this.myInput) {
      this.setState({ showPicker: false });
    }
  }

  reset() {
    this.timer = null;
    clearTimeout(this.timer);
    this.setState({
      lastKeypress: null,
      buttonFocusIndex: 0
    });
  }

  insertCharacter(char) {
    const input = this.myInput.current;
    const cursorPosition = App.getCursorIndex(input);
    let text = input.value.split('');
    text[cursorPosition - 1] = char;
    input.value = text.join('');
    input.focus();
    input.setSelectionRange(cursorPosition, cursorPosition);
    this.setState({ buttonFocusIndex: 0 });
  }

  showPicker(e) {
    if (e.which === KEYBOARD_KEYS.rightArrow) {
      this.setState({ buttonFocusIndex: this.state.buttonFocusIndex + 1 });
      return;
    }
    if (e.which === KEYBOARD_KEYS.leftArrow) {
      this.setState({ buttonFocusIndex: this.state.buttonFocusIndex - 1 });
      return;
    }
    const target = e.target;
    if (e.which === this.state.lastKeypress) {
      e.preventDefault();
      if (!this.timer) {
        this.timer = setTimeout(() => {
          const typedChar = target.value.split("")[
            App.getCursorIndex(target) - 1
          ];
          console.log(typedChar);
          if (App.getMapping()[typedChar]) {
            this.setState({
              showPicker: true,
              characters: App.getMapping()[typedChar]
            });
          } else {
            this.setState({ showPicker: false });
          }
        }, 10);
      }
      return;
    }
    this.setState({ lastKeypress: e.which });
  }

  render() {
    return (
      <div className="App">
        <input
          onKeyDown={this.showPicker}
          //onKeyUp={this.ensureCharsEntered}
          type="text"
          ref={this.myInput}
        />
        {this.state.showPicker && (
          <div>
            <ul>
              {this.state.characters.map((char, index) => (
                <li key={char}>
                  <button
                    className={
                      this.state.buttonFocusIndex === index ? "focused" : ""
                    }
                    autoFocus={index === 0}
                    onClick={() => this.insertCharacter(char)}
                  >
                    <span>{char}</span>
                    <span>{index + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
