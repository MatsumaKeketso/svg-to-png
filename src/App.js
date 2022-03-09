import React, { useState } from 'react'
import ticket from './assets/ticket.png'
import './App.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver'
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import IconButton from '@mui/material/IconButton';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import SaveAltRoundedIcon from '@mui/icons-material/SaveAltRounded';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import { initializeApp } from "firebase/app";
import { firebaseConfig } from './firebaseConfig';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { wait } from '@testing-library/user-event/dist/utils';

const app = initializeApp(firebaseConfig);

const Input = styled('input')({
  display: 'none',
});

function App() {
  const [name, setName] = useState("")
  const [surname, setSurname] = useState("")
  const [tickets, setTickets] = useState([])
  const [jsonData, setJsonData] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const storage = getStorage();


  const savePng = () => {
    var SVG = document.getElementById("svg")
    domtoimage.toPng(SVG)
      .then((dataUrl) => {
        var img = new Image();
        img.src = dataUrl;
        let imageSource = {
          src: dataUrl,
          name: `${name} ${surname}`
        }
        setTickets([...tickets, imageSource])
        // console.log(imageSource)
        // document.body.appendChild(img);
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error, SVG);
      });
  }

  const downloadImage = (ticket) => {
    saveAs(ticket.src, ticket.name);
  }

  const uploadToFirestore = (t) => {
    const storageRef = ref(storage, t.src);
    const uploadTask = uploadBytesResumable(storageRef);

    uploadTask.on('state_changed', (snap) => {
      const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
      setUploadProgress(progress)
      console.log('Upload is ' + uploadProgress + '% done');
    }, (err) => {

    }, () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downUrl) => {
        console.log('File available at', downUrl);
      })
    })
  }

  const getJson = async (file) => {
    fetch(file).then(res => res.json())
      .then(async (jsonData) => {
        jsonData.users.forEach((e, index) => {
          setTimeout(() => {
            console.log(e)
            setName(e.first_name)
            setSurname(e.last_name)
            savePng()
          }, index * 1000);
        });
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
        }, 3000);
      })
      .catch(err => {
        console.log(err);
      })
  }
  const handleCapture = ({ target }) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(target.files[0]);
    fileReader.onload = (e) => {
      getJson(e.target.result)
    };
  };
  return (
    <div className="App">
      <Container sx={{ w: '1280px' }} >
        <Typography sx={{ m: 3 }} align="center" variant='h3'>Ticket Entry</Typography>
        <Stack spacing={2} direction="row">
          <FormControl fullWidth >
            {/* Name */}
            <TextField onChange={(e) => {
              let val = e.target.value
              setName(val)
            }} id="outlined-basic" value={name} label="Name" variant="outlined" />
          </FormControl>

          {/* Surname */}
          <FormControl fullWidth
          >
            <TextField

              value={surname}
              onChange={(e) => {
                let val = e.target.value
                setSurname(val)
              }}
              id="outlined-basic"
              label="Surname"
              variant="outlined" /> </FormControl>
        </Stack>


        {/* Button */}
        <Stack spacing={2} justifyContent="space-between" direction="row" sx={{ mt: 1, mb: 1 }}>
          <Button fullWidth onClick={savePng} variant='contained'>Generate Image</Button>
          {/* <Stack> */}
          {/* <Button fullWidth onClick={getJson} variant='contained'>Import Json</Button> */}
          {/* <label htmlFor="contained-button-file"> */}
          {/* <Input accept=".json, json" id="contained-button-file" type="file" onChange={(e) => handleCapture(e)} /> */}
          {/* <Button sx={{ minWidth: 200 }} variant="contained" component="span"> */}
          {/* Select Json File */}
          {/* </Button> */}
          {/* </label> */}
          {/* </Stack> */}
        </Stack>
        <Stack>
          {success && (<Alert severity="success">
            <AlertTitle>File Ready</AlertTitle>
          </Alert>)}
          {error && (<Alert severity="error">
            <AlertTitle>File not Supported</AlertTitle>
            Something went wrong with opening this file.
          </Alert>)}
        </Stack>
        <div id="svg">
          <div className='user'>
            <p className='nameStyle'>{name}</p>
            <p className='surnameStyle'>{surname}</p>
          </div>
          <img src={ticket} width='100%' alt='redundant' />
        </div>
        
        <Grid container spacing={3} justifyContent="center"
          alignItems="center">

          {tickets.map((c, i) => {
            console.log(c)
            return (
              <Grid item ><Card sx={{ maxWidth: 345 }}>
                <CardMedia
                  component="img"
                  alt="green iguana"
                  height="140"
                  image={c.src}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {name} {surname}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => downloadImage(c)}>Download</Button>
                </CardActions>
              </Card></Grid>
            )
          })}

        </Grid>
      </Container>
    </div>
  );
}

export default App;
