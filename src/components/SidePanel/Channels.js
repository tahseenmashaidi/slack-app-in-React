import React, {Component} from 'react';
import {
    Modal,
    Icon,
    Menu,
    MenuItem,
    ModalHeader,
    ModalContent,
    Form,
    Input,
    ModalActions,
    Button, Label
} from "semantic-ui-react";
import firebase from "../../firebase";
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from "../../actions/action";

class Channels extends Component {
    state={
        user:this.props.currentUser,
        channelRef:firebase.database().ref('channels'),
        messageRef:firebase.database().ref('messages'),
        notifications:[],
        channels:[],
        channel:null,
        channelName:'',
        channelDetails:'',
        modal:false,
        firstLoad:true,
        activeChannel:''
    }
    componentDidMount() {
        this.addListeners();
    }
    componentWillUnmount() {
        this.removeListeners();
    }
    addListeners=()=>{
        let loadedChannels=[];
        this.state.channelRef.on('child_added',snap=>{
            loadedChannels.push(snap.val());
            this.setState({channels:loadedChannels},()=>this.setFirstChannel());
            this.addNotificationListener(snap.key);
        });
    };
    addNotificationListener=channelId=>{
        this.state.messageRef.child(channelId).on('value',snap=>{
            if (this.state.channel){
                this.handleNotifications(channelId,this.state.channel.id,this.state.notifications,snap);
            }
        });
    }
    handleNotifications=(channelId,currentChannelId,notifications,snap)=>{
        let lastTotal=0;

        let index=notifications.findIndex(notification=>notification.id===channelId);

        if (index!==-1){
            if (channelId!==currentChannelId){
                lastTotal=notifications[index].total;

                if (snap.numChildren() - lastTotal>0){
                    notifications[index].count=snap.numChildren()-lastTotal;
                }
            }
            notifications[index].lastKnownTotal=snap.numChildren();
        }else {
            notifications.push({
                id:channelId,
                total:snap.numChildren(),
                lastKnownTotal:snap.numChildren(),
                count:0
            });
        }

        this.setState({notifications});
    }
    removeListeners = () => {
        this.state.channelRef.off();
    };
    setFirstChannel=()=>{
        const firstChannel=this.state.channels[0];
        if (this.state.firstLoad&&this.state.channels.length>0){
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({channel:firstChannel});
        }
        this.setState({firstLoad:false});
    }

    addChannel=()=>{
        const {channelRef,channelName,channelDetails,user}=this.state;
        const key=channelRef.push().key;

        const newChannel={
            id:key,
            name:channelName,
            details:channelDetails,
            createdBy:{
                name:user.displayName,
                avatar:user.photoURL
            }
        };
        channelRef.child(key).update(newChannel).then(()=>{
            this.setState({channelName: '',channelDetails: ''});
            this.closeModal();
            console.log('channel added')
        }).catch(err=>{
            console.log(err)
        })
    };
    displayChannels=channels=>(
        channels.length>0 && channels.map(channel=>(
            <Menu.Item
                key={channel.id}
                onClick={()=>this.channelChange(channel)}
                name={channel.name}
                style={{opacity:0.7}}
                active={channel.id===this.state.activeChannel}
            >
                {this.getNotificationCount(channel)&&(
                    <Label color={'red'}>{this.getNotificationCount(channel)}</Label>
                )}
                # {channel.name}
            </Menu.Item>
        ))
    );
    getNotificationCount=channel=>{
        let count=0;

        this.state.notifications.forEach(notification=>{
           if (notification.id===channel.id){
               count=notification.count;
           }
        });

        if (count>0) return count;

    }
    channelChange=channel=>{
        this.setActiveChannel(channel);
        this.clearNotifications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({channel});
    };
    clearNotifications=()=>{
        let index=this.state.notifications.findIndex(notification=> notification.id===this.state.channel.id);

        if (index!==-1){
            let updatedNotifications=[...this.state.notifications];
            updatedNotifications[index].total=this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count=0;
            this.setState({notifications:updatedNotifications});
        }
    }
    setActiveChannel=channel=>{
        this.setState({activeChannel:channel.id});
    }
    closeModal=()=>this.setState({modal:false});
    openModal=()=>this.setState({modal:true});
    handleChange=event=>{
        this.setState({[event.target.name]:event.target.value});
    }
    handleSubmit=event=>{
        event.preventDefault();
        if(this.isFormValid(this.state)){
            this.addChannel();
        }
    };
    isFormValid=({channelDetails,channelName })=>channelName&&channelDetails;
    render() {
        const {channels ,modal}=this.state
        return (
            <React.Fragment>
                <Menu.Menu className={"menu"}>
                    <MenuItem>
                        <span>
                            <Icon name={"exchange"}/>CHANNELS
                        </span>{" "}
                        ({channels.length})<Icon name={"add"} onClick={this.openModal}/>
                    </MenuItem>
                    {this.displayChannels(channels)}
                </Menu.Menu>
                {/*Model for channels*/}
                <Modal  basic open={modal} onClose={this.closeModal}>
                    <ModalHeader>Add a Channels</ModalHeader>
                    <ModalContent>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input fluid label={"Name of Channel"} name={"channelName"}
                                       onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input fluid label={"About the Channel"} name={"channelDetails"}
                                       onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </ModalContent>
                    <ModalActions>
                        <Button color={"green"} inverted onClick={this.handleSubmit}>
                            <Icon name={"checkmark"}/> Add
                        </Button>
                        <Button color={"red"} onClick={this.closeModal} inverted>
                            <Icon name={"remove"}/> Cancel
                        </Button>
                    </ModalActions>
                </Modal>
            </React.Fragment>
        );
    }
}

export default connect(null,{setCurrentChannel,setPrivateChannel})(Channels);