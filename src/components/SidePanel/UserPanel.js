import React, { Component } from 'react';
import firebase from '../../firebase';
import { Dropdown, Grid, Header, Icon, Image } from 'semantic-ui-react';
import { connect } from 'react-redux';

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
  };

  dropdownOptions = () => {
    return [
      {
        key: 'user',
        text: (
          <span>
            Signed in as <strong>{this.state.user.displayName}</strong>
          </span>
        ),
        disabled: true,
      },
      {
        key: 'avatar',
        text: <span>Change Avatar</span>,
      },
      {
        key: 'signout',
        text: <span onClick={this.handleSignout}>Sign out</span>,
      },
    ];
  };

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log('signed out!'));
  };

  render() {
    const { user } = this.state;

    return (
      <Grid>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2em', margin: 0 }}>
            {/* App Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>DevChat</Header.Content>
            </Header>
            {/* User dropdown */}
            <Header style={{ padding: '0.25em' }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
