import React, {Component} from 'react';
import {Button, Input, Segment} from "semantic-ui-react";
import firebase from "../../firebase";
import FileModel from "./FileModel";
import uuidv4 from 'uuid/v4'
import ProgressBar from "./ProgressBar";


class MessageForm extends Component {
    state={
        message:'',
        loading:false,

        channel:this.props.currentChannel,
        user:this.props.currentUser,
        errors:[],
        model:false,
        uploadState:'',
        uploadTask:null,
        storageRef:firebase.storage().ref(),
        percentUpload:0,
    }
    handleChange=event=>{
        this.setState({[event.target.name]:event.target.value})
    };
    openModel=()=>this.setState({model:true});
    closeModel=()=>this.setState({model:false});
    createMessage=(fileUrl=null)=>{
        const {user}=this.state;
        const message={
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: user.uid,
                name: user.displayName,
                avatar: user.photoURL
            },

        };
        if (fileUrl!==null){
            message['image']=fileUrl ;
        }else {
            message['content']=this.state.message;
        }
        return message;
    }
    sendMessage=()=>{
        const {getMessageRef}=this.props;
        const {message,channel}=this.state;
        if(message){
            this.setState({loading:true});
            getMessageRef().child(channel.id).push().set(this.createMessage()).then(()=>{
                this.setState({loading:false,message: '',errors:[]})
            }).catch(err=>{
                console.log(err);
                this.setState({loading:false,errors:this.state.errors.concat(err)})
            })
        }else{
            this.setState({
                errors:this.state.errors.concat({message:'Add a message'})
            });
        }
    };
    getPath=()=>{
        if (this.props.isPrivateChannel){
            return `chat/private-${this.state.channel.id}`;
        }else {
            return `chat/public`;
        }
    }

    uploadFile=(file,metadata)=>{
        const pathToUpload=this.state.channel.id;
        const ref=this.props.getMessageRef();
        const filePath=`${this.getPath()}${uuidv4()}.jpg`;
        this.setState({
            uploadState:'uploading',
            uploadTask:this.state.storageRef.child(filePath).put(file,metadata)
        }, ()=>{
            this.state.uploadTask.on('state_changed',snap=>{
                const percentUpload=Math.round((snap.bytesTransferred/ snap.totalBytes)*100);
                this.props.isProgressBarVisible(percentUpload);
                this.setState({percentUpload})
            },err=>{
                console.log(err);
                this.setState({
                    errors:this.state.errors.concat(err),
                    uploadState:'error',
                    uploadTask:null
                })
            },()=>{
                this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl=>{
                    this.sendFileMessage(downloadUrl,ref,pathToUpload);
                }).catch(err=>{
                    console.log(err);
                    this.setState({
                        errors:this.state.errors.concat(err),
                        uploadState:'error',
                        uploadTask:null
                    })
                })
            })
        })
    };
    sendFileMessage=(fileURL,ref,pathToUpload)=>{
        ref.child(pathToUpload).push().set(this.createMessage(fileURL)).then(()=>{
            this.setState({uploadState:'done'});
        }).catch(err=>{
            console.log(err);
            this.setState({
                errors:this.state.errors.concat({err})
            });
        })
    };
    render() {
        const {errors,message,loading,model,percentUpload,uploadState}=this.state;
        return (
            <Segment  className={"message_form"}>
                <Input fluid name={"message"} style={{marginBottom:'0.7em'}}
                       onChange={this.handleChange}
                       label={<Button icon={'add'}/>}
                       labelPosition={"left"}
                       value={message}
                       className={errors.some(error=>error.message.includes('message'))?'error':''}
                       placeholder={"Write your message"}
                />
                <Button.Group icon widths={"2"}>
                    <Button color={"orange"}
                            disabled={loading}
                            onClick={this.sendMessage}
                            content={"Add Reply"}
                            labelPosition={"left"}
                            icon={"edit"}
                    />
                    <Button color={"teal"}
                            disabled={uploadState==='uploading'}
                            onClick={this.openModel}
                            content={"Upload media"}
                            labelPosition={"right"}
                            icon={"cloud upload"}
                    />
                </Button.Group>
                <FileModel
                    model={model}
                    closeModel={this.closeModel}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar
                    uploadState={uploadState}
                    percentUpload={percentUpload}
                />
            </Segment>
        );
    }
}

export default MessageForm;