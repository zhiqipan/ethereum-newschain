import React, { Component } from 'react';
import BraftEditor from 'braft-editor';
import HtmlViewer from './HtmlViewer';

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

    if (this.props.disabled) {
      return (
        <div style={{ ...styles.wrapper, padding: 10 }}>
          <HtmlViewer html={this.props.initialHtml} style={{ height: 574, overflow: 'auto' }} />
        </div>
      );
    }

    return (
      <div style={styles.wrapper}>
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

const styles = {
  wrapper: {
    border: '1px solid lightgray',
    borderRadius: 4,
  },
};
