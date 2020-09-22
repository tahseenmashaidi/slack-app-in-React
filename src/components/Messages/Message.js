import React from 'react';
import {Comment, Image} from "semantic-ui-react";
import moment from "moment";

const isOwnMessage=(massage,user)=>{
    return massage.user.id===user.uid?'message_self':'';

}
const timeFormNow=timestamp=>moment(timestamp).fromNow();
const isImage=(message)=>{
    return message.hasOwnProperty('image')&& !message.hasOwnProperty('content');
}


const Message = ({message,user}) => (
    <Comment>
        <Comment.Avatar src={message.user.avatar}/>
        <Comment.Content className={isOwnMessage(message,user)}>
            <Comment.Author as={'a'}>{message.user.name}</Comment.Author>
            <Comment.Metadata>{timeFormNow(message.timestamp)}</Comment.Metadata>

            {isImage(message)?
                <Image src={message.image} className={"message_image"}/>
                : <Comment.Text>{message.content}</Comment.Text>
            }
        </Comment.Content>
    </Comment>
);

export default Message;