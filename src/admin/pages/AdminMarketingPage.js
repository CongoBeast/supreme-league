import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { RefreshCw } from 'lucide-react';

import AdminMetaAdsPanel from '../components/AdminMetaAdsPanel';
import AdminPageHeader from '../components/AdminPageHeader';

export default function AdminMarketingPage() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <>
      <AdminPageHeader
        title="Marketing"
        description="Track Meta ad spend against Supreme Fantasy League sign-ups, paying customers and attributed revenue."
        actions={(
          <Button
            type="button"
            variant="outline-dark"
            onClick={() => setRefreshToken((value) => value + 1)}
          >
            <RefreshCw size={16} />
            <span className="ms-2">Refresh Meta data</span>
          </Button>
        )}
      />

      <AdminMetaAdsPanel refreshToken={refreshToken} />
    </>
  );
}
