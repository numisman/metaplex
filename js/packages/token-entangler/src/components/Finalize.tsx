import { Box, Button, FormGroup, LinearProgress } from '@mui/material';
import React, { useState, useMemo } from 'react';
import Card from '@mui/material/Card';
import { useConnection } from '../contexts';
import { PublicKey } from '@solana/web3.js';
import Typography from '@mui/material/Typography';
import createTxn from '../utils/prepHoodies';

export const Finalize = () => {
    return (
        <Typography>
            This is the Finalize Page
        </Typography>
    )
}