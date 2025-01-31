import React from "react"
import { action } from "@storybook/addon-actions"
import { withKnobs, select } from "@storybook/addon-knobs"
import { Typography } from "../Typography"

export default {
  title: "Typography",
  component: Typography,
  excludeStories: /.*Data$/,
  decorators: [withKnobs]
}

export const actionsData = {
  onClick: action("onClickTypography")
}

type VariantOption = "h1"
|"h2"
|"h3"
|"h4"
|"h5"
|"h6"
|"subtitle1"
|"subtitle2"
|"body1"
|"body2"
|"caption"
|"button"

const variantOptions: VariantOption[] = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "subtitle1",
  "subtitle2",
  "body1",
  "body2",
  "caption",
  "button"
]

type ComponentOption = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p"
const componentOptions: ComponentOption[] = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
  "p"
]

export const TypographyStory = (): React.ReactNode => (
  <Typography
    {...actionsData}
    component={select("Component", componentOptions, "h2")}
    variant={select("Variant", variantOptions, "body1")}
  >
    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi quia
    suscipit autem molestiae officia nesciunt, mollitia quod nobis cum
    blanditiis harum impedit deserunt sequi officiis incidunt rem. Ab, non
    assumenda.
  </Typography>
)
