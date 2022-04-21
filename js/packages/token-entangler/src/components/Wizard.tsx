/* eslint-disable no-extra-boolean-cast */
import { Box, Button, FormGroup, LinearProgress } from '@mui/material';
import React, { useState, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { useConnection } from '../contexts';

import { useWallet } from '@solana/wallet-adapter-react';

import * as anchor from '@project-serum/anchor';
import { getOwnedNFTMints, searchEntanglements } from '../utils/entangler';
import { useHistory } from 'react-router-dom';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export const Wizard = () => {
  const connection = useConnection();
  const wallet = useWallet();
  const history = useHistory();

  const [entanglements, setEntanglements] = React.useState<Array<object>>([]);
  const [myNFTs, setMyNFTs] = React.useState<Array<object>>([]);
  const [loading, setLoading] = useState(false);

  const authority = process.env.REACT_APP_WHITELISTED_AUTHORITY!;
  const juiceAuthority = "Co1dxFc7MDWUKeEiDuW47EWeoiMT1L7BUWnNG6HP9JUi";

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

  const handleSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (!anchorWallet) {
      return;
    }
    setLoading(true);
    setEntanglements([]);
    const res = await getOwnedNFTMints(anchorWallet, connection);
    const walletNFTMints = res.map(token => token.info.mint);
    setMyNFTs(walletNFTMints);
    const allEntanglementsMap: any[] = [];
    for (let i = 0; i < walletNFTMints.length; i++) {
      const { entanglements, metadata } = await searchEntanglements(
        anchorWallet,
        connection,
        walletNFTMints[i],
        authority,
      );
      const juiceDatas = await searchEntanglements(
        anchorWallet,
        connection,
        walletNFTMints[i],
        juiceAuthority,
      );
      allEntanglementsMap.push({
        mint: walletNFTMints[i],
        entanglements,
        metadata,
      });
      allEntanglementsMap.push({
        mint: walletNFTMints[i],
        entanglements: juiceDatas.entanglements,
        metadata: juiceDatas.metadata,
      });
    }
    console.log('Entangle', allEntanglementsMap);
    setEntanglements([...(await allEntanglementsMap)]);
    setLoading(false);
  };

  const handleEntanglementClick = async (
    event: React.MouseEvent<HTMLElement>,
    entanglement: any,
  ) => {
    event.preventDefault();
    await localStorage.setItem('mintA', entanglement.mintA.toString());
    await localStorage.setItem('mintB', entanglement.mintB.toString());
    await localStorage.setItem('entanglement', '');
    history.push(`swap/`);
  };

  return (
    <React.Fragment>
      <Typography variant="h4" color="text.primary" gutterBottom>
        Search Outfits{' '}
      </Typography>

      <p>Searches outfits of your Pandas </p>

      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <FormGroup>
          <Button
            disabled={!anchorWallet || loading || !!!authority}
            variant="contained"
            onClick={async e => await handleSubmit(e)}
            endIcon={<SearchIcon />}
          >
            Search Outfits
          </Button>
          {!!!authority && (
            <Alert severity="error" style={{ marginTop: '1rem' }}>
              <AlertTitle>Error</AlertTitle>
              Please set the whitelisted entanglement authority using the
              environment variable <b>REACT_APP_WHITELISTED_AUTHORITY</b>.
            </Alert>
          )}
        </FormGroup>
      </Box>
      <Box sx={{ maxWidth: 'md', display: 'block', marginTop: '2rem' }}>
        <Typography variant="h5" color="text.primary" gutterBottom>
          My outfits:{' '}
        </Typography>
        {loading && <LinearProgress />}

        {
          //@ts-ignore
          entanglements.map((e: any) => {
            return (
              <Card sx={{ minWidth: 275, boxShadow: 3, mb: 3 }} key={e.mint}>
                <CardContent>
                  <Typography
                    sx={{ fontSize: 19 }}
                    component="div"
                    gutterBottom
                  >
                    <strong>{e.mint}</strong>
                  </Typography>
                  {e.entanglements.length > 0 && (
                    <React.Fragment>
                      <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Mints
                      </Typography>
                      {e.entanglements.map((m: any) => (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          key={m.mintA.toString()}
                          sx={{ marginBottom: '2rem' }}
                        >
                          <strong>MintA</strong> : {`${m.mintA.toString()}`}{' '}
                          <br />
                          <strong>MintB</strong> : {`${m.mintB.toString()}`}{' '}
                          <br />
                          <strong>Price</strong> : {`${m.price.toString()}`}{' '}
                          <br />
                          <strong>Pays Every Time</strong> :{' '}
                          {`${m.paysEveryTime}`} <br />
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: myNFTs.find(
                                (d: any) => d == m.mintA.toBase58(),
                              )
                                ? 'row'
                                : 'row-reverse',
                              justifyContent: 'space-evenly',
                              alignItems: 'center',
                            }}
                          >
                            <img
                              style={{ width: '100px', height: '100px' }}
                              src={
                                e.metadata.find(d => d.mint.equals(m.mintA))
                                  .imageUrl
                              }
                            />
                            <p>becomes</p>
                            <img
                              style={{ width: '100px', height: '100px' }}
                              src={
                                e.metadata.find(d => d.mint.equals(m.mintB))
                                  .imageUrl
                              }
                            />
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-evenly',
                              alignItems: 'center',
                            }}
                          >
                            <Button
                              onClick={event =>
                                handleEntanglementClick(event, m)
                              }
                              variant="contained"
                              startIcon={<SwapHorizIcon />}
                              sx={{ marginTop: '1rem' }}
                            >
                              CHANGE OUTFIT
                            </Button>
                          </div>
                        </Typography>
                      ))}
                    </React.Fragment>
                  )}
                </CardContent>
              </Card>
            );
          })
        }
      </Box>
    </React.Fragment>
  );
};
