import { Box } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import React from "react";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Box
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      fontSize={12}
      backgroundColor="#1e6a2cff"
      color="white"
      cursor="pointer"
      onClick={handleFunction}
      display="flex"
      alignItems="center"
    >
      {user.name}
      <CloseIcon pl={1} boxSize={3} />
    </Box>
  );
};

export default UserBadgeItem;
