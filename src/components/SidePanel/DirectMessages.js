import React, { Component } from 'react';
import { Icon, Menu } from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';

class DirectMessages extends Component {
  state = {
    activeChannel: '',
    user: this.props.currentUser,
    users: [],
    usersCollection: firebase.database().ref('users'),
    connectedCollection: firebase.database().ref('.info/connected'),
    presenceCollection: firebase.database().ref('presence'),
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  addListeners = (currentUserUid) => {
    let loadedUsers = [];

    this.state.usersCollection.on('child_added', (snapshot) => {
      if (currentUserUid !== snapshot.key) {
        let user = snapshot.val();
        user['uid'] = snapshot.key;
        user['status'] = 'offline';
        loadedUsers.push(user);
        this.setState({ users: loadedUsers });
      }
    });

    this.state.connectedCollection.on('value', (snapshot) => {
      if (snapshot.val() === true) {
        const ref = this.state.presenceCollection.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove((error) => {
          if (error != null) {
            console.error(error);
          }
        });
      }
    });

    this.state.presenceCollection.on('child_added', (snapshot) => {
      if (currentUserUid !== snapshot.key) {
        this.addStatusToUser(snapshot.key);
      }
    });

    this.state.presenceCollection.on('child_removed', (snapshot) => {
      if (currentUserUid !== snapshot.key) {
        this.addStatusToUser(snapshot.key, false);
      }
    });
  };

  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((accumulator, user) => {
      if (user.uid === userId) {
        user['status'] = `${connected ? 'online' : 'offline'}`;
      }
      return accumulator.concat(user);
    }, []);
    this.setState({ users: updatedUsers });
  };

  isUserOnline = (user) => user.status === 'online';

  changeChannel = (user) => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name,
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };

  getChannelId = (userId) => {
    const currentUserUid = this.state.user.uid;
    return userId < currentUserUid
      ? `${userId}/${currentUserUid}`
      : `${currentUserUid}/${userId}`;
  };

  setActiveChannel = (userId) => {
    this.setState({ activeChannel: userId });
  };

  render() {
    const { users, activeChannel } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> Direct Messages 📧
          </span>{' '}
          ({users.length})
        </Menu.Item>
        {users.map((user) => (
          <Menu.Item
            key={user.uid}
            active={user.uid === activeChannel}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: 'italic' }}
          >
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? 'green' : 'red'}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  DirectMessages
);
