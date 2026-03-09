import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { parseUnits, stringify } from 'viem'
import { Actions } from 'viem/tempo'
import {
  useConnect,
  useConnection,
  useConnectorClient,
  useConnectors,
  useDisconnect,
  useSendTransactionSync,
  useSignMessage,
  useSignTypedData,
  WagmiProvider,
} from 'wagmi'
import { Hooks } from 'wagmi/tempo'

import { config } from './config.js'

const queryClient = new QueryClient()

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div style={{ maxWidth: 640 }}>
          <h1>zyzz wagmi example</h1>

          <h2>Connection</h2>
          <Connection />

          <h2>Connect</h2>
          <Connect />
          <Faucet />

          <h2>Transactions</h2>
          <SendTransaction />

          <h2>Signing</h2>
          <SignMessage />
          <SignTypedData />

          <h2>Receipts</h2>
          <GetTransactionReceipt />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function Connection() {
  const { address, chainId, status } = useConnection()
  return (
    <pre>{stringify({ address: address ?? null, chainId: chainId ?? null, status }, null, 2)}</pre>
  )
}

function Connect() {
  const { mutate: connect, status, error } = useConnect()
  const { mutate: disconnect } = useDisconnect()
  const { status: connectionStatus } = useConnection()
  const connectors = useConnectors()
  const connector = connectors[0]

  if (!connector) return null

  return (
    <div>
      <button type="button" onClick={() => connect({ connector })}>
        Login
      </button>
      <button
        type="button"
        onClick={() =>
          connect({
            connector,
            capabilities: { method: 'register', name: 'Wagmi Example' },
          })
        }
      >
        Register
      </button>
      {connectionStatus !== 'disconnected' && (
        <button type="button" onClick={() => disconnect()}>
          Disconnect
        </button>
      )}
      <div>{status}</div>
      {error && <pre style={{ color: 'red' }}>{error.message}</pre>}
    </div>
  )
}

function Faucet() {
  const { address } = useConnection()
  const { mutate, data, error, isPending } = Hooks.faucet.useFundSync()
  return (
    <div>
      <h3>tempo_fundAddress</h3>
      <button disabled={!address || isPending} onClick={() => mutate({ account: address! })}>
        Fund Account
      </button>
      {error && <pre style={{ color: 'red' }}>{error.message}</pre>}
      {data !== undefined && <pre>{stringify(data, null, 2)}</pre>}
    </div>
  )
}

function SendTransaction() {
  const { mutate: sendTransactionSync, data, error, isPending } = useSendTransactionSync()
  return (
    <div>
      <h3>eth_sendTransaction</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          sendTransactionSync({
            calls: [
              Actions.token.transfer.call({
                to: form.get('to') as string as `0x${string}`,
                token: '0x20c0000000000000000000000000000000000000',
                amount: parseUnits((form.get('amount') as string) || '0', 6),
              }),
            ],
          } as any)
        }}
        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
      >
        <input
          name="to"
          defaultValue="0x0000000000000000000000000000000000000001"
          placeholder="To (0x...)"
          style={{ flex: 1, fontFamily: 'monospace' }}
        />
        <input name="amount" defaultValue="1" placeholder="Amount" style={{ width: 80 }} />
        <button type="submit" disabled={isPending}>
          Send
        </button>
      </form>
      {error && <pre style={{ color: 'red' }}>{`${error.name}: ${error.message}`}</pre>}
      {data !== undefined && <pre>{stringify(data, null, 2)}</pre>}
    </div>
  )
}

function SignMessage() {
  const { mutate: signMessage, data, error, isPending } = useSignMessage()
  return (
    <div>
      <h3>personal_sign</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const message = new FormData(e.currentTarget).get('message') as string
          if (!message) return
          signMessage({ message })
        }}
        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
      >
        <input
          name="message"
          defaultValue="hello world"
          placeholder="Message"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={isPending}>
          Sign
        </button>
      </form>
      {error && <pre style={{ color: 'red' }}>{`${error.name}: ${error.message}`}</pre>}
      {data !== undefined && <pre>{data}</pre>}
    </div>
  )
}

function SignTypedData() {
  const { mutate: signTypedData, data, error, isPending } = useSignTypedData()
  return (
    <div>
      <h3>eth_signTypedData_v4</h3>
      <button
        disabled={isPending}
        onClick={() =>
          signTypedData({
            types: {
              Person: [
                { name: 'name', type: 'string' },
                { name: 'wallet', type: 'address' },
              ],
              Mail: [
                { name: 'from', type: 'Person' },
                { name: 'to', type: 'Person' },
                { name: 'contents', type: 'string' },
              ],
            },
            primaryType: 'Mail',
            message: {
              from: { name: 'Alice', wallet: '0x0000000000000000000000000000000000000001' },
              to: { name: 'Bob', wallet: '0x0000000000000000000000000000000000000002' },
              contents: 'Hello, Bob!',
            },
          })
        }
      >
        Sign
      </button>
      {error && <pre style={{ color: 'red' }}>{`${error.name}: ${error.message}`}</pre>}
      {data !== undefined && <pre>{data}</pre>}
    </div>
  )
}

function GetTransactionReceipt() {
  const { data: client } = useConnectorClient()
  const [result, error, execute] = useRequest()
  return (
    <div>
      <h3>eth_getTransactionReceipt</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const hash = new FormData(e.currentTarget).get('hash') as string
          if (!hash || !client) return
          execute(() =>
            client.request({
              method: 'eth_getTransactionReceipt',
              params: [hash as `0x${string}`],
            }),
          )
        }}
        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
      >
        <input
          name="hash"
          placeholder="Enter tx hash (0x...)"
          style={{ flex: 1, fontFamily: 'monospace' }}
        />
        <button type="submit">Get Receipt</button>
      </form>
      {error && <pre style={{ color: 'red' }}>{error.message}</pre>}
      {result !== undefined && <pre>{stringify(result, null, 2)}</pre>}
    </div>
  )
}

function useRequest() {
  const [result, setResult] = useState<unknown>()
  const [error, setError] = useState<Error>()
  const execute = useCallback(async (fn: () => Promise<unknown>) => {
    try {
      setError(undefined)
      setResult(await fn())
    } catch (e) {
      setResult(undefined)
      setError(e instanceof Error ? e : new Error(String(e)))
    }
  }, [])
  return [result, error, execute] as const
}
