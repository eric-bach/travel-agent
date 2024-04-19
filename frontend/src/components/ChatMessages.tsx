import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, Button, TextField, Grid, IconButton, List, Typography } from '@mui/material';
import { Conversation } from '../common/types';
import React from 'react';
import ChatDebug from './ChatDebug';

interface ChatMessagesProps {
  prompt: string;
  conversation: Conversation | undefined;
  isLoadingMessage: boolean;
  handlePromptChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  submitMessage: (event: any) => Promise<void>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ prompt, conversation, isLoadingMessage, submitMessage, handlePromptChange, handleKeyPress }) => {
  const [showDebug, setShowDebug] = React.useState<number>(0);
  const [debug, setDebug] = React.useState<any[]>([]);

  function handleClick(i: number) {
    if (i === showDebug) {
      setShowDebug(0);
      setDebug([]);
    } else {
      setShowDebug(i);
      setDebug(conversation?.messages[i].debug);
    }
  }

  return (
    <>
      <Grid item={true} md={6} sx={{ pr: '30px' }}>
        <Typography variant='h5' sx={{ pb: '15px' }}>
          Conversation
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '5px' }}>
          <List>
            {conversation?.messages.map((message, i) => (
              <div key={i}>
                {message.type === 'agent' ? (
                  <Typography
                    align='right'
                    sx={{
                      backgroundColor: '#1976d2',
                      borderTopLeftRadius: 30,
                      borderBottomLeftRadius: 30,
                      borderTopRightRadius: 30,
                      borderBottomRightRadius: 5,
                      padding: 2,
                      color: 'white',
                      width: '75%',
                      textAlign: 'right',
                      marginLeft: 'auto',
                      marginBottom: 2,
                    }}
                  >
                    {message.content}
                    <br />
                    <Button sx={{ color: 'white' }} disableRipple onClick={() => handleClick(i)}>
                      Toggle Trace
                    </Button>
                  </Typography>
                ) : (
                  <Typography
                    align='left'
                    sx={{
                      backgroundColor: '#f5f5f5',
                      borderTopLeftRadius: 30,
                      borderBottomLeftRadius: 5,
                      borderTopRightRadius: 30,
                      borderBottomRightRadius: 30,
                      padding: 2,
                      width: '75%',
                      textAlign: 'left',
                      marginBottom: 2,
                    }}
                  >
                    {message.content}
                  </Typography>
                )}
              </div>
            ))}
            {isLoadingMessage && <CircularProgress size={40} sx={{ mt: 2 }} />}
          </List>
          <Box display='flex' alignItems='center'>
            <TextField
              disabled={isLoadingMessage}
              type='text'
              id='prompt'
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyPress}
              placeholder={'Ask anything...'}
              sx={{ width: '100%' }}
              InputProps={{
                endAdornment: (
                  <IconButton type='submit' onClick={(e) => submitMessage(e)}>
                    <DoubleArrowIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>
      </Grid>
      <Grid item={true} md={6}>
        <ChatDebug debug={debug} />
      </Grid>
    </>
  );
};

export default ChatMessages;
