import React, { Component } from 'react';
import { Segment, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';
import uuidv4 from 'uuid';
import ProgressBar from './ProgressBar';

class MessageForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref('typing'),
    percentUploaded: 0,
    uploadTask: null,
    uploadState: '',
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

  handleKeyDown = () => {
    const { message, typingRef, channel, user } = this.state;
    console.log(message.length);
    console.log('typing message', message);
    if (message) {
      console.log('typing...');
      typingRef.child(channel.id).child(user.uid).set(user.displayName);
    } else {
      typingRef.child(channel.id).child(user.uid).remove();
    }
  };

  sendMessage = () => {
    // const { msessageCollection } = this.props; // does not work, so we create an instance here
    const { getMessageCollection } = this.props; //firebase.database().ref('messages');
    const { message, channel, user, typingRef } = this.state;

    if (message) {
      this.setState({ loading: true });
      getMessageCollection()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: '', errors: [] });
          typingRef.child(channel.id).child(user.uid).remove();
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err),
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: 'Add a message' }),
      });
    }
  };

  createMessage = (fileUrl = null) => {
    const message = {
      timeStamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
    };

    if (fileUrl !== null) {
      message['image'] = fileUrl;
    } else {
      message['content'] = this.state.message;
    }
    return message;
  };

  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return 'chat/public';
    }
  };

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const msessageCollection = this.props.getMessageCollection(); // does not work, so we create an instance here

    // const msessageCollection = firebase.database().ref('messages');
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: 'uploading',
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata),
      },
      () => {
        this.state.uploadTask.on(
          'state_changed',
          (snapshot) => {
            const percentUploaded = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          (error) => {
            console.error(error);
            this.setState({
              errors: this.state.errors.concat(error),
              uploadState: 'error',
              uploadTask: null,
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadUrl) => {
                this.sendFileMessage(
                  downloadUrl,
                  msessageCollection,
                  pathToUpload
                );
              })
              .catch((error) => {
                console.error(error);
                this.setState({
                  errors: this.state.errors.concat(error),
                  uploadState: 'error',
                  uploadTask: null,
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: 'done' });
      })
      .catch((error) => {
        console.error(error);
        this.setState({ errors: this.state.errors.concat(error) });
      });
  };

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
    } = this.state;

    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          value={message}
          style={{ marginBottom: '0.7em' }}
          label={<Button icon={'add'} />}
          labelPosition="left"
          className={
            errors.some((error) => error.message.includes('message'))
              ? 'error'
              : ''
          }
          placeholder="Write your message"
        />
        <Button.Group icon widths="2">
          <Button
            onClick={this.sendMessage}
            disabled={loading}
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
          />
          <Button
            color="teal"
            disabled={uploadState === 'uploading'}
            onClick={this.openModal}
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        {uploadState === 'uploading' && (
          <ProgressBar
            uploadState={uploadState}
            percentUploaded={percentUploaded}
          />
        )}
      </Segment>
    );
  }
}

export default MessageForm;
