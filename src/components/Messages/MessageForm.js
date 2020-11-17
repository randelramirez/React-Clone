import React, { Component } from 'react';
import { Segment, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';

class MessageForm extends Component {
  state = {
    message: '',
    channel: this.props.currentChannel,
    loading: false,
    user: this.props.currentUser,
    errors: [],
    modal: false,
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  handleChange = (event) =>
    this.setState({ [event.target.name]: event.target.value });

  sendMessage = () => {
    // const { msessageCollection } = this.props; // does not work, so we create an instance here
    const msessageCollection = firebase.database().ref('messages');

    const { message, channel } = this.state;

    console.log({ channel });
    if (message) {
      this.setState({ loading: true });
      msessageCollection
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: '', errors: [] });
        })
        .catch((error) => {
          console.error(error);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(error),
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: 'Add a message' }),
      });
    }
  };

  createMessage = () => {
    const message = {
      timeStamp: firebase.database.ServerValue.TIMESTAMP,
      content: this.state.message,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
    };
    return message;
  };

  render() {
    const { errors, message, loading, modal } = this.state;

    return (
      <Segment className="message__form">
        <Input
          fluid
          value={message}
          onChange={this.handleChange}
          name="message"
          style={{ marginBottom: '0.7em' }}
          label={<Button icon="add" />}
          className={
            errors.some((error) => error.message.includes('message'))
              ? 'error'
              : ''
          }
          labelPosition="left"
          placeholder="Write your message"
        />
        <Button.Group icon widths="2">
          <Button
            onClick={this.sendMessage}
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
            disabled={loading}
          />
          <Button
            onClick={this.openModal}
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
          <FileModal modal={modal} closeModal={this.closeModal} />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessageForm;
