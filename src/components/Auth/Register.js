import React, { Component } from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
import  md5  from 'md5';


export default class Register extends Component {
    state = {
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        errors: [],
        loading: false,
        usersRef:firebase.database().ref('users'),
    };
    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };
    isFormValid = () => {
        let errors = [];
        let error;
        if (this.isFormEmpty(this.state)) {
            error = { message: 'fill in all fields' };
            this.setState({ errors: errors.concat(error) });
            return false;
        } else if (!this.isPasswordValid(this.state)) {
            error = { message: 'password is invalid' };
            this.setState({ errors: errors.concat(error) });
            return false;
        } else {
            return true;
        }
    };
    isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length;
    };
    isPasswordValid = ({ password, passwordConfirmation}) => {
        if (password.length < 6 || passwordConfirmation.length < 6) {
            return false;
        }
        else if (password !== passwordConfirmation) {
            return false;
        } else {
            return true;
        }
    };
    displayError = errors => (
        errors.map((error, i) => (
            <p key={i}>{error.message}</p>
        ))
    );
    handleInputError = (errors, inputName) => {
        return errors.some(error =>
            error.message.toLowerCase().includes(inputName)
        )
            ? 'error' : "";
    }
    handleSubmit = (event) => {
        event.preventDefault();
        if (this.isFormValid()) {
            this.setState({ errors: [], loading: true });
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(createdUser => {
                    if (createdUser.user !== null) { 
                        createdUser.user.updateProfile({
                            displayName: this.state.username,
                            photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`,
                        }).then(() => {
                            this.saveUser(createdUser).then(() => {
                                console.log("user save successfully");
                            });
                            this.setState({loading:false})
                        }).catch(err => {
                            console.log(err);
                            this.setState({ errors: this.state.errors.concat(err), loading: false });
                        })
                    }
                }).catch(err => {
                    console.log(err);
                    this.setState({errors:this.state.errors.concat(err), loading: false });
                })
        }
    };
    saveUser = createdUser => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar:createdUser.user.photoURL
        })
    };
    render() {
        const { username, email, password, passwordConfirmation,errors ,loading} = this.state;
        return (
            <Grid textAlign="center" verticalAlign='middle' className="app">
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h1" icon color="orange" textAlign="center"> 
                        <Icon name="puzzle piece" color="orange" />
                        Register for DevChat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input value={username} fluid name="username" icon="user" iconPosition="left"
                                type="text" placeholder="Username" onChange={this.handleChange}
                            />
                            < Form.Input fluid value={email} name="email" icon="mail" iconPosition="left"
                                type="email" placeholder="Email" onChange={this.handleChange}
                                className={this.handleInputError(errors,'email')}
                            />
                            < Form.Input fluid value={password} name="password" icon="lock" iconPosition="left"
                                type="Password" placeholder="Password" onChange={this.handleChange}
                                className={this.handleInputError(errors,'password')}
                            />
                            < Form.Input fluid value={passwordConfirmation} name="passwordConfirmation" icon="repeat" iconPosition="left"
                                type="Password" placeholder="Password confirmation" onChange={this.handleChange}
                                className={this.handleInputError(errors,'password')}
                            />
                            <Button
                                color="orange"
                                fluid size="large"
                                disabled={loading}
                                className={loading?'loading':''}
                            >Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayError(errors)}
                        </Message>
                    )}
                    <Message>Already a user? <Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}
