import React, {Component} from 'react';
import {Header, Icon, Input, Segment} from "semantic-ui-react";

class MessageHeader extends Component {
    render() {
        const {
            channelName,
            numUniqueUsers,
            handleSearchChange,
            searchLoading,
            isPrivateChannel
        }=this.props;
        return (
            <Segment clearing>
                <Header fluid={"true"} floated={"left"} style={{marginBottom:0}} as={"h2"}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && <Icon name={"star outline"} color={"black"}/>}
                    </span>
                    <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>
                <Header floated={"right"}>
                    <Input
                        loading={searchLoading}
                        size={"mini"}
                        icon={"search"}
                        name={"searchTerm"}
                        onChange={handleSearchChange}
                        placeholder={"Search Message"}
                    />
                </Header>
            </Segment>
        );
    }
}

export default MessageHeader;