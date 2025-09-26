import { Box, ContextView, Inline } from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";

const PaymentListView = ({userContext, environment}: ExtensionContextValue) => {
  return (
    <ContextView
      title="Hello world"
      externalLink={{
        label: "View docs",
        href: "https://stripe.com/docs/stripe-apps",
      }}
    >
      <Box
        css={{
          background: "container",
          borderRadius: "medium",
          marginTop: "small" ,
          padding: "large",
          wordBreak: "break-all",
        }}>
        Edit{" "}
        <Inline css={{ fontFamily: "monospace" }}>src/views/PaymentListView.tsx</Inline>{" "}
        and save to reload this view.
      </Box>
    </ContextView>
  );
};

export default PaymentListView;
