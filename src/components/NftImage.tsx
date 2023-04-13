import React, { useEffect, useState } from 'react'
import { TokenData } from '../types/Token'
import Loader from './popups/Loader'
import Row from './spacing/Row'
import Text from './text/Text'

interface NftImageProps extends React.HTMLAttributes<HTMLDivElement> {
  nftInfo?: TokenData
  style?: any
}

const NftImage: React.FC<NftImageProps> = ({ nftInfo, style, ...props }) => {
  const [imageSource, setImageSource] = useState<string | undefined>()
  
  useEffect(() => {
    if (nftInfo?.uri) {
      if (nftInfo.uri.includes('ipfs')) {
        
        // (async function() {
        //   // prereqs
        //   const node = await ipfsConnection
        //   if (nftInfo?.uri) {
        //     const cid = nftInfo.uri.replace('ipfs://', '/ipfs/')
    
        //     // load the raw data from js-ipfs (>=0.40.0)
        //     let bufs = []
        //     for await (const buf of node.cat(cid)) {
        //       bufs.push(buf)
        //     }
        //     const data = Buffer.concat(bufs)
    
        //     const blob = new Blob([data], { type: 'image/jpg' })
        //     setImageSource(window.URL.createObjectURL(blob))
        //   }
        // })()
      } else {
        setImageSource(nftInfo.uri)
      }
    }
  }, [nftInfo])

  if (!nftInfo) {
    return null
  }

  return (
    imageSource ?
      <img src={imageSource} style={{ ...(style || {}), maxWidth: '100%' }} className="nft-image" alt={String(nftInfo.id)} /> :
      <Row>
        <Loader dark />
        <Text small>Loading image...</Text>
      </Row>
  )
}

export default NftImage
