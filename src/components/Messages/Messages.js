import React from 'react';
import { Comment, Segment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';
import Message from './Message';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';

class Messages extends React.Component {
  state = {
    messageCollection: firebase.database().ref('messages'),
    privateChannel: this.props.isPrivateChannel,
    privateMessageCollection: firebase.database().ref('privateMessages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    isChannelStarred: false,
    usersCollection: firebase.database().ref('users'),
    messages: [],
    messagesLoading: true,
    numberOfUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
  };

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
      this.addUserStarsListener(channel.id, user.uid);
    }
  }

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
  };

  addMessageListener = (channelId) => {
    let loadedMessages = [];
    const ref = this.getMessageCollection();
    ref.child(channelId).on('child_added', (snapshot) => {
      loadedMessages.push(snapshot.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false,
      });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
  };

  countUserPosts = (messages) => {
    let userPosts = messages.reduce((accumulator, message) => {
      if (message.user.name in accumulator) {
        accumulator[message.user.name].count += 1;
      } else {
        accumulator[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return accumulator;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  addUserStarsListener = (channelId, userId) => {
    this.state.usersCollection
      .child(userId)
      .child('starred')
      .once('value')
      .then((data) => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  getMessageCollection = () => {
    const {
      messageCollection,
      privateMessageCollection,
      privateChannel,
    } = this.state;
    return privateChannel ? privateMessageCollection : messageCollection;
  };

  handleStar = () => {
    this.setState(
      (prevState) => ({
        isChannelStarred: !prevState.isChannelStarred,
      }),
      () => this.starChannel()
    );
  };

  starChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.usersCollection
        .child(`${this.state.user.uid}/starred`)
        .update({
          [this.state.channel.id]: {
            name: this.state.channel.name,
            details: this.state.channel.details,
            createdBy: {
              name: this.state.channel.createdBy.name,
              avatar: this.state.channel.createdBy.avatar,
            },
          },
        });
    } else {
      this.state.usersCollection
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove((error) => {
          if (error !== null) {
            console.error(error);
          }
        });
    }
  };

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value, searchLoading: true }, () =>
      this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, 'gi');
    const searchResults = channelMessages.reduce((accumulator, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        accumulator.push(message);
      }
      return accumulator;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => {
      this.setState({ searchLoading: false });
    }, 1000);
  };

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((accumulator, message) => {
      if (!accumulator.includes(message.user.name)) {
        accumulator.push(message.user.name);
      }
      return accumulator;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numberOfUniqueUsers = `${uniqueUsers.length} user${
      plural ? 's' : ''
    }`;
    this.setState({ numberOfUniqueUsers });
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

  displayChannelName = (channel) => {
    return channel
      ? `${this.state.privateChannel ? '@' : '#'}${channel.name}`
      : '';
  };

  render() {
    // prettier-ignore
    const { messageCollection, messages, channel, user, numberOfUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel, isChannelStarred } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numberOfUniqueUsers={numberOfUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />

        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messageCollection}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagCollection={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
