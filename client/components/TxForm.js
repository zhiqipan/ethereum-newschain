import React, { Component } from 'react';
import { Button, Form, Grid, Input, Message } from 'semantic-ui-react';
import { isValidAddress, isValidAmount } from '../utils/validate';

export default class TxForm extends Component {
  static defaultProps = {
    submitButtonOptions: { content: 'Transact' },
    width: 6,
    fields: [],
    getWarningMessage: async (formData) => null,
    getSuccessMessage: async (formData, result) => null,
    transaction: async (formData) => null,
    afterTransaction: async (formData, result) => null,
  };

  state = {
    transacting: false,
    errorMessage: '',
    warningMessage: '',
    successMessage: '',
  };

  onFieldChange = name => e => this.setState({ ['_' + name]: e.target.value });

  onFormSubmit = async () => {
    const valid = this.props.fields.map(({ name, validate }) => {
      const value = this.state['_' + name];
      if (validate === 'address') {
        return isValidAddress(value);
      } else if (validate === 'token-amount') {
        return isValidAmount(value);
      } else {
        return true;
      }
    }).filter(Boolean).length === this.props.fields.length;

    if (!valid) return null;

    this.setState({ transacting: true, errorMessage: '', warningMessage: '' });

    const formData = {};
    this.props.fields.forEach(({ name }) => formData[name] = this.state['_' + name]);

    const warningMessage = await this.props.getWarningMessage(formData);
    this.setState({ warningMessage });

    let result;
    try {
      result = await this.props.transaction(formData);
      if (process.browser) {
        const successMessage = await this.props.getSuccessMessage(formData, result);
        this.setState({ successMessage }, () => {
          setTimeout(() => this.setState({ successMessage: '' }), 3000);
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    const empty = {};
    this.props.fields.forEach(({ name }) => empty['_' + name] = '');
    this.setState({ ...empty, transacting: false });
    await this.props.afterTransaction(formData, result);
  };

  render() {
    const { width, submitButtonOptions, fields } = this.props;
    const { transacting, errorMessage, warningMessage, successMessage } = this.state;
    return (
      <Grid>
        <Grid.Column width={width} textAlign='left'>
          <Form error={!!errorMessage} warning={!!warningMessage} onSubmit={this.onFormSubmit}>
            {fields.map(field => {
              const { name, label, ...restProps } = field;
              return (
                <Form.Field key={name}>
                  <label>{label}</label>
                  <Input value={this.state['_' + name]} onChange={this.onFieldChange(name)} {...restProps} />
                </Form.Field>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button style={{ margin: 0 }} {...submitButtonOptions} loading={transacting} disabled={transacting} />
            </div>
            <Message error header='Oops...' content={errorMessage} />
            <Message warning header='Warning' content={warningMessage} />
            <Message positive hidden={!successMessage} header='Successful' content={successMessage} />
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}
