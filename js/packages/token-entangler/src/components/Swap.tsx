import React from 'react';
import { useConnection } from '../contexts';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo, useEffect } from 'react';
import * as anchor from '@project-serum/anchor';
import { swapEntanglement } from '../utils/entangler';
import { Box, Button, FormGroup, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';


export const Swap = () => {
  const connection = useConnection();
  const wallet = useWallet();

  const [mintA, setMintA] = React.useState(localStorage.getItem('mintA') || '');
  const [mintB, setMintB] = React.useState(localStorage.getItem('mintB') || '');
  const [hoodieURI, setHoodieURI] = React.useState(localStorage.getItem('hoodieURI') || '');
  const [streetAddress1, setStreetAddress1] = React.useState('');
  const [streetAddress2, setStreetAddress2] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [zip, setZip] = React.useState('');
  const [entangledPair, setEntangledPair] = React.useState(
    localStorage.getItem('entangledPair') || '',
  );

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  useEffect(() => {
    (async () => {
      if (!anchorWallet) {
        return;
      }
    })();
  }, [anchorWallet]);

  const handleSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (!anchorWallet) {
      return;
    }
    const txnResult = await swapEntanglement(
      anchorWallet,
      connection,
      mintA,
      mintB,
      entangledPair,
    );
    setEntangledPair(txnResult.epkey);
  };

  const isEnable = (
    mintA: string,
    mintB: string,
    entangledPair: string,
  ): boolean => {
    return (
      // eslint-disable-next-line no-extra-boolean-cast
      (!!mintA && !!mintB && !!!entangledPair) ||
      (!(!!mintA || !!mintB) && !!entangledPair)
    );
  };

  const handleDragStart = (e) => e.preventDefault();
  const items = [
    <a href="www.google.com"><img alt="trashPanda1"
         height="100px"
         width="100px"
         src="https://img.rarible.com/prod/image/upload/t_image_big/prod-itemImages/SOLANA-Bs56Sd5brQucuSFDj3cRYES46dd6Cx7WFEUCio5wg5BY/2d18cdf1"
         onDragStart={handleDragStart}
         role="presentation" /></a>,
    <a href="www.yahoo.com"><img alt="trashPanda2"
         height="100px"
         width="100px"
         src="https://www.arweave.net/x4Jl6dhJX01u-oRjhTZzNBLGu0gFMJ33x55bR2TZ72s?ext=png"
         onDragStart={handleDragStart}
         role="presentation" /></a>,
  ];

  return (
    <React.Fragment>
      <Typography variant="h4" color="text.primary" gutterBottom>
        Exchange Dumpster
      </Typography>
      <p>You chose this hoodie</p>
      <img
          alt="Sweatshirt"
          style={{ width: '100px', height: '100px' }}
          src={hoodieURI}
        />
      <p>Now who is going to wear it?</p>
      <AliceCarousel mouseTracking items={items} />
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >

        <TextField
          id="streetAddress1-text-field"
          label="Address 1"
          value={streetAddress1}
          onChange={e => {setStreetAddress1(e.target.value);}}
        />
        <TextField
          id="streetAddress2-text-field"
          label="Address 2"
          value={streetAddress2}
          onChange={e => {setStreetAddress2(e.target.value);}}
        />
        <TextField
          id="city-text-field"
          label="City"
          value={city}
          onChange={e => {setCity(e.target.value);}}
        />
        <TextField
          id="state-text-field"
          label="State"
          value={state}
          onChange={e => {setState(e.target.value);}}
        />
        <TextField
          id="zip-text-field"
          label="Zip/Postal Code"
          value={zip}
          onChange={e => {setZip(e.target.value);}}
        />

        <FormGroup>
          <Button
            variant="contained"
            onClick={async e => await handleSubmit(e)}
            endIcon={<SendIcon />}
            disabled={!isEnable(mintA, mintB, entangledPair)}
          >
            CHANGE OUTFITS
          </Button>
        </FormGroup>
      </Box>

      <Box component="span" sx={{ display: 'block', marginTop: '2rem' }}>
        {!entangledPair ? (
          ''
        ) : (
          <Typography variant="h5" color="text.primary" gutterBottom>
            Entangled Pair swap complete!
          </Typography>
        )}
        <p>{entangledPair}</p>
      </Box>
    </React.Fragment>
  );
};
