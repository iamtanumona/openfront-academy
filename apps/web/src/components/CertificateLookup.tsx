import {useEffect,useState} from 'react';
import CertificateVerifier from './CertificateVerifier';
export default function CertificateLookup(){const [id,setId]=useState('');useEffect(()=>setId(new URLSearchParams(window.location.search).get('id')??''),[]);return id?<CertificateVerifier id={id}/>:<p>Provide a certificate link with a valid ID.</p>;}
