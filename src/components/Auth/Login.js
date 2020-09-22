import React, { Component } from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';


export default class Login extends Component {
    state = {
        email: "",
        password: "",
        errors: [],
        loading: false,
    };
    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
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
        if (this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true });
            firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(signedInUser => {
                    console.log(signedInUser);
                    this.setState({ loading: false });
                }).catch(err => {
                    console.log(err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        loading: false
                    });
                });
        }
    };
    isFormValid = ({ email, password }) => email && password;
    render() {
        const {  email, password,errors ,loading} = this.state;
        return (
            <Grid textAlign="center" verticalAlign='middle' className="app">
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h1" icon color="violet" textAlign="center"> 
                        <Icon name="code branch" color="violet" />
                        Login to DevChat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            < Form.Input fluid value={email} name="email" icon="mail" iconPosition="left"
                                type="email" placeholder="Email" onChange={this.handleChange}
                                className={this.handleInputError(errors,'email')}
                            />
                            < Form.Input fluid value={password} name="password" icon="lock" iconPosition="left"
                                type="Password" placeholder="Password" onChange={this.handleChange}
                                className={this.handleInputError(errors,'password')}
                            />
                            <Button
                                color="violet"
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
                    <Message>Don't have an account? <Link to="/register">Register</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}
