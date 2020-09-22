import React, {Component} from 'react';
import { Segment, Comment} from "semantic-ui-react";
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";


class Messages extends Component {
    state={
        messageRef:firebase.database().ref('messages'),
        privateMessagesRef:firebase.database().ref('privateMessages'),
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        privateChannel:this.props.isPrivateChannel,
        messages:[],
        messageLoading:true,
        progressBar:false,
        numUniqueUsers:'',
        searchTerm:'',
        searchLoading:false,
        searchResults:[],
    };
    componentDidMount() {
        const {channel,user}=this.state;
        if (channel&&user){
            this.addListeners(channel.id);
        }
    }
    addListeners=channelId=>{
        this.addMessageListener(channelId)
    };
    displayMessage=message=>(
        message.length>0&&message.map(message=>(
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        ))
    )

    addMessageListener= channelId=>{
        let loadedMessage=[];
        const ref=this.getMessageRef();
        ref.child(channelId).on('child_added',snap=>{
            loadedMessage.push(snap.val());
            this.setState({
                messages:loadedMessage,
                messageLoading:false
            });
            this.countUniqueUsers(loadedMessage);
        })
    };
    countUniqueUsers=message=>{
        const uniqueUsers=message.reduce((acc,message)=>{
            if (!acc.includes(message.user.name)){
                acc.push(message.user.name);
            }
            return acc;
        },[]);
        const plural=uniqueUsers.length>1||uniqueUsers.length===0;
        const numUniqueUsers=`${uniqueUsers.length} user${plural ? 's':""}`;
        this.setState({numUniqueUsers});
    }
    isProgressBarVisible=percent=>{
        if (percent>0){
            this.setState({progressBar:true});
        }
    }
    displayChannelName=channel=> {
        return channel?`${this.state.privateChannel?'@':'#'}${channel.name}`:'';
    };
    handleSearchChange=event=>{
        this.setState({
            searchTerm:event.target.value,
            searchLoading:true
        },()=>this.handleSearchMessage());
    }
    handleSearchMessage=()=>{
        const channelMessage=[...this.state.messages];
        const regex=new RegExp(this.state.searchTerm,'gi');
        const searchResults=channelMessage.reduce((acc,message)=>{
            if (message.content&&message.content.match(regex)||message.user.name.match(regex)){
                acc.push(message);
            }
            return acc;
        },[]);
        this.setState({searchResults})
        setTimeout(()=>this.setState({searchLoading:false}),1000)
    }
    getMessageRef=()=>{
        const {messageRef,privateMessagesRef,privateChannel}=this.state;
        return privateChannel?privateMessagesRef:messageRef;
    }
    render() {
        const {messageRef,channel,messages,user,progressBar,numUniqueUsers,searchTerm,searchResults,searchLoading ,privateChannel}=this.state;
        return (
            <React.Fragment>
                <MessageHeader
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                />
                <Segment>
                    <Comment.Group className={progressBar? 'message_progress' : 'messages'}>
                        {searchTerm?
                            this.displayMessage(searchResults)
                            :
                            this.displayMessage(messages)
                        }
                    </Comment.Group>
                </Segment>
                <MessageForm
                    currentChannel={channel}
                    messageRef={messageRef}
                    currentUser={user}
                    isProgressBarVisible={this.isProgressBarVisible}
                    isPrivateChannel={privateChannel}
                    getMessageRef={this.getMessageRef}
                />
            </React.Fragment>
        );
    }
}

export default Messages;
