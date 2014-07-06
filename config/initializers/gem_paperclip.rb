if Rails.env.development?
  module Paperclip
    class MediaTypeSpoofDetector
      # disable "spoofed" check in the development environment. Paperclip's "spoofed" check doesn't work well in Windows.
      def spoofed?
        false
      end
    end
  end
end