import React from 'react';
import { Comment, Segment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';
import Message from './Message';

class Messages extends React.Component {
  state = {
    messageCollection: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
  };

  componentDidMount() {
    const { channel, user } = this.state;
    this.setState({ messageCollection: firebase.database().ref('messages') });
    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
  };

  addMessageListener = (channelId) => {
    let loadedMessages = [];
    this.state.messageCollection.child(channelId).on('child_added', (snap) => {
      loadedMessages.push(snap.val());
      this.setState({ messages: loadedMessages, messagesLoading: false });
    });
  };

  displayMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message
        key={message.timeStamp}
        message={message}
        user={this.state.user}
      />
    ));

  render() {
    const { messageCollection, channel, user, messages } = this.state;
    console.log('messages', messages);
    return (
      <React.Fragment>
        <MessagesHeader />
        <Segment>
          <Comment.Group className="messages">
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm
          messageCollection={
            /*this does not work, MessageForm component is getting undefined value from the send handler */
            messageCollection
          }
          currentChannel={channel}
          currentUser={user}
        />
      </React.Fragment>
    );
  }
}

export default Messages;
