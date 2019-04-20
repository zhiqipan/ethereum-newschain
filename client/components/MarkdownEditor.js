import React, { Component } from 'react';
import BraftEditor from 'braft-editor';
import HtmlViewer from './HtmlViewer';

// basic demo: https://braft.margox.cn/demos/basic
export default class MarkdownEditor extends Component {
  static defaultProps = {
    placeholder: '',
    initialValue: '',
    disabled: false,
    onChange: () => null,
    onSave: () => null,
  };

  state = {
    editorState: null,
  };

  componentDidMount() {
    this.setState({ editorState: BraftEditor.createEditorState(this.props.initialValue) });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.setState({ editorState: BraftEditor.createEditorState(this.props.initialValue) });
    }
  }

  render() {
    const { editorState, loading } = this.state;

    if (this.props.disabled) {
      return (
        <div style={{ ...styles.wrapper, padding: 10 }}>
          <HtmlViewer html={editorState.toHTML()} style={{ height: 574, overflow: 'auto' }} />
        </div>
      );
    }

    return (
      <div style={styles.wrapper}>
        {loading ?
          <p>Loading...</p> :
          <BraftEditor
            placeholder={this.props.placeholder}
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
        }
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
