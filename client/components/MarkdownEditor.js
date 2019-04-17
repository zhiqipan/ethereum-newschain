import 'braft-editor/dist/index.css';
import React, { Component } from 'react';
import BraftEditor from 'braft-editor';

// basic demo: https://braft.margox.cn/demos/basic
export default class MarkdownEditor extends Component {
  static defaultProps = {
    initialHtml: '',
    onChange: () => null,
    onSave: () => null,
  };

  state = {
    editorState: null,
  };

  componentDidMount() {
    this.setState({ editorState: BraftEditor.createEditorState(this.props.initialHtml) });
  }

  render() {
    const { editorState } = this.state;

    return (
      <div style={{ border: '1px solid lightgray', borderRadius: 4 }}>
        <BraftEditor
          value={editorState}
          onChange={editorState => {
            this.setState({ editorState });
            const htmlContent = editorState.toHTML();
            this.props.onChange(htmlContent);
          }}
          onSave={() => { // triggered when ctrl+s
            const htmlContent = editorState.toHTML();
            this.props.onSave(htmlContent);
          }}
        />
      </div>
    );
  }
}
