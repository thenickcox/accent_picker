import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
import Popover from "react-tiny-popover";

import "./styles.css";

const KEYBOARD_KEYS = {
  esc: 27,
  enter: 13,
  rightArrow: 39,
  leftArrow: 37,
  ALL_NUMBER_KEYS: [49, 50, 51, 52, 53, 54, 55, 56, 57]
};

class App extends Component {
  static getCursorIndex(input) {
    return input.selectionStart || input.selectionStart === "0"
      ? input.selectionStart
      : 0;
  }

  static getLetterCase(letter) {
    return letter.toLowerCase() === letter ? "lower" : "upper";
  }

  static getMapping() {
    return {
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
    this.insertCharacter = this.insertCharacter.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleNumberKeys = this.handleNumberKeys.bind(this);
    this.isOtherKey = this.isOtherKey.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
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
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keypress", this.handleKeyPress);
    document.addEventListener("keyup", this.reset);
  }

  componentWillUnmount() {
    document.removeEventListener("keypress", this.handleKeyDown);
    document.removeEventListener("keypress", this.handleKeyPress);
    document.removeEventListener("keyup", this.reset);
  }

  // Is the user just trying to type a different character?
  isOtherKey(typed) {
    return !Object.keys(App.getMapping()).includes(typed.toLowerCase());
  }

  // keyPress event gives case-senstive mappings, but only keyDown
  // tracks things like escape and enter.
  handleKeyPress(e) {
    // if any other key, close
    const typed = String.fromCharCode(e.which);
    if (this.isOtherKey(typed)) {
      this.setState({ showPicker: false });
      this.insertCharacter(typed, { insertBehind: false });
    }
  }

  handleKeyDown(e) {
    if (!this.state.showPicker) return;
    if (KEYBOARD_KEYS.ALL_NUMBER_KEYS.includes(e.which)) {
      return this.handleNumberKeys(e);
    }
    if (e.which === KEYBOARD_KEYS.enter) return this.handleEnter(e);
    if (e.which === KEYBOARD_KEYS.esc)
      return this.setState({ showPicker: false });

    const bIndex = this.state.buttonFocusIndex;
    const charLength = this.state.characters.length;
    if (e.which === KEYBOARD_KEYS.leftArrow && bIndex > 0) {
      return this.setState({ buttonFocusIndex: bIndex - 1 });
    }
    if (e.which === KEYBOARD_KEYS.rightArrow && bIndex < charLength - 1) {
      return this.setState({ buttonFocusIndex: bIndex + 1 });
    }
  }

  ensureCharsEntered(e) {
    if (e.target.value.length === 0) {
      this.setState({ showPicker: false });
    }
  }

  reset() {
    this.timer = null;
    clearTimeout(this.timer);
    this.setState({
      lastKeypress: null
    });
  }

  insertCharacter(char, opts) {
    const input = this.myInput.current;
    const cursorPosition = App.getCursorIndex(input);
    let text = input.value.split("");
    // Default to inserting behind the cursor
    if (!opts) text[cursorPosition - 1] = char;
    input.value = text.join("");
    input.focus();
    input.setSelectionRange(cursorPosition, cursorPosition);
    this.setState({ showPicker: false });
  }

  handleEnter(e) {
    e.preventDefault();
    const currentCharacter = this.state.characters[this.state.buttonFocusIndex];
    this.insertCharacter(currentCharacter);
  }

  handleNumberKeys(e) {
    e.preventDefault();
    const buttonIndex = KEYBOARD_KEYS.ALL_NUMBER_KEYS.indexOf(e.which);
    this.insertCharacter(this.state.characters[buttonIndex]);
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
          const charCase = App.getLetterCase(typedChar);
          const caseFunction =
            charCase === "lower" ? "toLowerCase" : "toUpperCase";
          const typedCharAsLower = typedChar.toLowerCase();
          if (App.getMapping()[typedCharAsLower]) {
            const characters = App.getMapping()[typedCharAsLower].map(letter =>
              String.prototype[caseFunction].call(letter)
            );
            this.setState({
              showPicker: true,
              characters,
              buttonFocusIndex: 0
            });
          } else {
            this.setState({ showPicker: false });
          }
        }, 10);
      }
      return;
    }
    return this.setState({ lastKeypress: e.which });
  }

  render() {
    return (
      <div className="App">
        <Popover
          isOpen={this.state.showPicker}
          position={["top", "bottom"]}
          padding={30} // actually height offset
          onClickOutside={() => this.setState({ showPicker: false })}
          containerStyle={{
            boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            border: "1px solid #e6f1f3",
            padding: "10px",
            background: "#fff",
            overflow: "visible"
          }}
          content={({ position, targetRect, popoverRect }) => (
            <Fragment>
              <ul className="buttons">
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
              <div className="popoverArrow" />
            </Fragment>
          )}
        >
          <input
            onKeyDown={this.showPicker}
            onKeyUp={this.ensureCharsEntered}
            type="text"
            ref={this.myInput}
          />
        </Popover>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
