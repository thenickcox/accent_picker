import React, { Component } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

const KEYBOARD_KEYS = {
  'esc': 27,
  'enter': 13,
};

class App extends Component {
  static getCursorIndex(input) {
    // TODO cleanup
    return input.selectionStart || input.selectionStart === "0"
      ? input.selectionStart
      : 0;
  }

  static getMapping() {
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
      i: ["î, ï"],
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
    this.timer = null;
    this.myInput = React.createRef();
    this.state = {
      showPicker: false,
      characters: [],
      lastKeypress: undefined
    };
  }

  componentDidMount() {
    document.addEventListener("click", this.hidePicker);
    document.addEventListener('keydown', this.conditionallyHidePicker);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.hidePicker);
    document.removeEventListener('keydown', this.conditionallyHidePicker);
  }

  conditionallyHidePicker(e) {
    if (e.which === KEYBOARD_KEYS.esc) this.setState({ showPicker: false });
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

  insertCharacter(char) {
    const input = this.myInput.current;
    let text = input.value.split();
    text[App.getCursorIndex(input) - 1] = char;
    input.value = text.join();
  }

  showPicker(e) {
    const target = e.target;
    if (e.which === this.state.lastKeypress) {
      e.preventDefault();
      if (!this.timer) {
        this.timer = setTimeout(() => {
          const typedChar = target.value.split('')[
            App.getCursorIndex(target) - 1
          ];
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
          onKeyUp={this.ensureCharsEntered}
          type="text"
          ref={this.myInput}
        />
        {this.state.showPicker && (
          <div>
            <ul>
              {this.state.characters.map((char, index) => (
                <li key={char}>
                  <button onClick={() => this.insertCharacter(char)}>
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
