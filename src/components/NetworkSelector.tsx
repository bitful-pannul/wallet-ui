import React, { useCallback, useMemo, useState } from 'react'

import { UQBAR_NETWORK_HEX } from '../utils/constants'
import Button from './form/Button'
import logo from '../assets/img/logo192.png'
import ethLogo from '../assets/img/eth-logo.png'
import goerliLogo from '../assets/img/goerli-logo.jpg'
import Row from './spacing/Row'

interface NetworkSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  currentChainId?: string;
  setChainId: (chainId: string) => void;
}

const NetworkSelector = ({ currentChainId, setChainId, ...props }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const networks: {[key: string]: any} = useMemo(() => ({
      '0x1': {
        chainId: '0x1',
        chainName: 'Mainnet',
        logo: ethLogo,
      },
      '0x5': {
        chainId: '0x5',
        chainName: 'Goerli',
        logo: goerliLogo,
      },
      [UQBAR_NETWORK_HEX]: {
        chainId: UQBAR_NETWORK_HEX,
        chainName: 'Uqbar',
        logo
      },
  }), []);

  const handleClick = useCallback((chainId: string) => async () => {
      setIsOpen(!isOpen);
      setChainId(chainId);
  }, [isOpen, setChainId])

  return (
    <div {...props} className={`${props.className} dropdown`}>
      <Button className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        {Boolean(networks[currentChainId || '']?.logo) && <img src={networks[currentChainId || '']?.logo} style={{ height: 20, width: 20, borderRadius: 10, margin: '-4px 8px -4px 0' }} />}
        {networks[currentChainId || '']?.chainName || "Select a network"}
      </Button>
      {isOpen && (
        <>
          <div className="dropdown-background" onClick={() => setIsOpen(!isOpen)} />
          <div className="dropdown-body" onClick={e => e.stopPropagation()}>
            {Object.values(networks).map(({ chainId, chainName, logo }) => (
              <Row key={chainId} className="dropdown-item" onClick={handleClick(chainId)}>
                <img src={logo} style={{ height: 20, width: 20, borderRadius: 10, marginRight: 8 }} />
                {chainName}
              </Row>
            ))}
          </div>
        </>
      )}
      <style>
        {`.dropdown {
            position: relative;
            display: inline-block;
        }

        .dropdown-header {
            padding: 10px;
            background-color: #ddd;
            cursor: pointer;
        }

        .dropdown-body {
            position: absolute;
            width: 100%;
            z-index: 1;
            background-color: #f1f1f1;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            border-radius: 4px;
        }

        .dropdown-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            right: 0;
            bottom: 0;
        }

        .dropdown-item {
            padding: 10px;
            cursor: pointer;
            border-radius: 4px;
        }

        .dropdown-item:hover {
            background-color: #ddd;
        }`}
      </style>
    </div>
  );
}

export default NetworkSelector
