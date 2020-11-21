import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';
import firebase from '../../firebase';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import Typing from './Typing';

class Messages extends React.Component {
  state = {
    messageCollection: firebase.database().ref('messages'),
    privateChannel: this.props.isPrivateChannel,
    privateMessageCollection: firebase.database().ref('privateMessages'),

    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    isChannelStarred: false,
    user: this.props.currentUser,
    usersCollection: firebase.database().ref('users'),
    numberOfUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    typingRef: firebase.database().ref('typing'),
    typingUsers: [],
    connectedRef: firebase.database().ref('.info/connected'),
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
    this.addTypingListeners(channelId);
  };

  addTypingListeners = (channelId) => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on('child_added', (snap) => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val(),
        });
        this.setState({ typingUsers });
      }
    });

    this.state.typingRef.child(channelId).on('child_removed', (snap) => {
      const index = typingUsers.findIndex((user) => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter((user) => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });

    this.state.connectedRef.on('value', (snap) => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove((err) => {
            if (err !== null) {
              console.error(err);
            }
          });
      }
    });
  };

  addMessageListener = (channelId) => {
    let loadedMessages = [];
    const ref = this.getMessageCollection();
    ref.child(channelId).on('child_added', (snap) => {
      loadedMessages.push(snap.val());
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
        .remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };

  handleSearchChange = (event) => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, 'gi');
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
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

  displayTypingUsers = (users) =>
    users.length > 0 &&
    users.map((user) => (
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '0.2em' }}
        key={user.id}
      >
        <span className="user__typing">{user.name} is typing</span> <Typing />
      </div>
    ));

  render() {
    // prettier-ignore
    const {
      
      messages,
      channel,
      user,
      numberOfUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading,
      privateChannel,
      isChannelStarred,
      typingUsers,
    } = this.state;

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
            {this.displayTypingUsers(typingUsers)}
          </Comment.Group>
        </Segment>

        <MessageForm
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessageCollection={this.getMessageCollection}
        />
      </React.Fragment>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
