// import { render, screen, fireEvent } from "@testing-library/react";
// import PlayAgainModal from "./PlayAgainModal";

// describe("PlayAgainModal", () => {
//   it("показывает имя победителя и счётчик готовых игроков", () => {
//     render(
//       <PlayAgainModal winnerName="Player 1" isWinner readyCount={1} totalPlayers={2} />,
//     );
//     expect(screen.getByText("Player 1")).toBeInTheDocument();
//     expect(screen.getByText("1/2 gotowych")).toBeInTheDocument();
//   });

//   it("после клика переходит в 'Gotowy!' и вызывает onPlayAgain", () => {
//     const onPlayAgain = jest.fn();
//     render(<PlayAgainModal winnerName="Player 1" onPlayAgain={onPlayAgain} />);

//     fireEvent.click(screen.getByRole("button", { name: /graj ponownie/i }));

//     expect(onPlayAgain).toHaveBeenCalledTimes(1);
//     expect(screen.getByText("Gotowy!")).toBeInTheDocument();
//   });
// });