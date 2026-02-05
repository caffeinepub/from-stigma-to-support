import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2 } from 'lucide-react';
import { SiFacebook, SiX, SiInstagram, SiWhatsapp } from 'react-icons/si';
import { toast } from 'sonner';

export default function ShareWebsiteDialog() {
  const appUrl = window.location.origin;
  const shareText = 'Check out From Stigma to Support - A comprehensive academic wellness support platform';

  const handleShare = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + appUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct web sharing, copy link instead
        navigator.clipboard.writeText(appUrl);
        toast.success('Link copied! Share it on Instagram');
        return;
      case 'messenger':
        shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(appUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(appUrl)}`;
        break;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Website</DialogTitle>
          <DialogDescription>
            Share this wellness support platform with your friends and community
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 justify-start"
            onClick={() => handleShare('whatsapp')}
          >
            <SiWhatsapp className="w-5 h-5 text-green-600" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 justify-start"
            onClick={() => handleShare('facebook')}
          >
            <SiFacebook className="w-5 h-5 text-blue-600" />
            Facebook
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 justify-start"
            onClick={() => handleShare('twitter')}
          >
            <SiX className="w-5 h-5" />
            Twitter (X)
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 justify-start"
            onClick={() => handleShare('instagram')}
          >
            <SiInstagram className="w-5 h-5 text-pink-600" />
            Instagram
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Click on any platform to share this website
        </div>
      </DialogContent>
    </Dialog>
  );
}

