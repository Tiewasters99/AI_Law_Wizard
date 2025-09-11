'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Coins, Plus, Zap, Cloud, HelpCircle } from 'lucide-react'
import { Wallet } from '../../lib/stripe'

interface WalletSidebarProps {
  wallet: Wallet | null
  onTokenPurchase: () => void
  onConnectStorage: () => void
}

export const WalletSidebar = ({ wallet, onTokenPurchase, onConnectStorage }: WalletSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Wallet Card */}
      {wallet && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{wallet.tokens}</div>
              <div className="text-sm text-gray-600">AI Analysis Credits</div>
            </div>

            {wallet.tokens < 5 && (
              <Button
                onClick={onTokenPurchase}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buy More Credits
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={onConnectStorage}
            variant="outline"
            size="sm"
            className="w-full justify-start h-12"
          >
            <Cloud className="w-4 h-4 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Connect Storage</div>
              <div className="text-xs text-gray-500">Sync your files</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-12"
          >
            <HelpCircle className="w-4 h-4 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Help Center</div>
              <div className="text-xs text-gray-500">Get support</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
