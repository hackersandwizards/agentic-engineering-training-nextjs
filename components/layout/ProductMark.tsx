import { Box, Flex, Text } from "@chakra-ui/react";

// The h&w wordmark, then the product name. Text beside the wordmark centres
// on its box, which is centred on the letters.
export function ProductMark() {
  return (
    <Flex align="center" gap={3}>
      <picture>
        <source
          srcSet="/wordmark-night.svg"
          media="(prefers-color-scheme: dark)"
        />
        <img
          src="/wordmark.svg"
          alt="hackers&wizards"
          style={{ display: "block", height: 20 }}
        />
      </picture>
      <Box w="1px" alignSelf="stretch" bg="border" />
      <Text
        as="span"
        fontFamily="heading"
        fontWeight="bold"
        fontSize="lg"
        lineHeight="1"
      >
        CRM
      </Text>
    </Flex>
  );
}
