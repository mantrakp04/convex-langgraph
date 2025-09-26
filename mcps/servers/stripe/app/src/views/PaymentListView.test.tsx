import {render, getMockContextProps} from "@stripe/ui-extension-sdk/testing";
import {ContextView} from "@stripe/ui-extension-sdk/ui";

import PaymentListView from "./PaymentListView";

describe("PaymentListView", () => {
  it("renders ContextView", () => {
    const {wrapper} = render(<PaymentListView {...getMockContextProps()} />);

    expect(wrapper.find(ContextView)).toContainText("save to reload this view");
  });
});
