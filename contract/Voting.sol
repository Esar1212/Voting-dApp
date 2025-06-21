// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {

    address public owner;
    bool public votingEnded;

    struct Candidate {
        string name;
        uint voteCount;
    }

    mapping(string => Candidate) public candidates;
    mapping(string => bool) private isCandidate;
    string[] public candidateList;
    address[] public Voters;

    mapping(address => bool) public hasVoted;

    constructor(string[] memory _candidateNames) {
        owner = msg.sender;
        for (uint i = 0; i < _candidateNames.length; i++) {
            string memory name = _candidateNames[i];
            candidates[name] = Candidate(name, 0);
            isCandidate[name] = true;
            candidateList.push(name);
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    modifier votingActive() {
        require(!votingEnded, "Voting has ended.");
        _;
    }

    function vote(string memory _candidateName) public votingActive {
        require(!hasVoted[msg.sender], "You have already voted.");
        require(isCandidate[_candidateName], "Candidate does not exist.");

        candidates[_candidateName].voteCount += 1;
        hasVoted[msg.sender] = true;
        Voters.push(msg.sender);
    }

    function totalVotesFor(string memory _candidateName) public view returns (uint) {
        require(isCandidate[_candidateName], "Candidate does not exist.");
        return candidates[_candidateName].voteCount;
    }

    function getAllCandidates() public view returns (string[] memory) {
        return candidateList;
    }

    function endVoting() public onlyOwner {
        votingEnded = true;
    }

    function resetVote() public onlyOwner {
        for(uint i=0; i< candidateList.length ; i++)
        {
            string memory candidateName = candidateList[i];
            candidates[candidateName].voteCount = 0;
        }
        votingEnded = false;
        for(uint i=0 ; i < Voters.length ; i++)
        {
            hasVoted[Voters[i]] = false;
        }
        delete Voters;
    }

    function declareWinner() public view returns (string memory) {
        require(votingEnded, "Voting must be ended to declare winner.");
        uint highestVotes = 0;
        string memory winner1;
    
        uint flag = 0;

        for (uint i = 0; i < candidateList.length; i++) {
            string memory name = candidateList[i];
            if (candidates[name].voteCount > highestVotes) {
                highestVotes = candidates[name].voteCount;
                winner1 = name;
            }

        }
        for(uint i=0 ; i < candidateList.length ; i++)
        {
            string memory name = candidateList[i];
            if(candidates[name].voteCount == highestVotes)
            {
                 flag++;
            }
        }
        if(flag > 1)
          winner1 = "No winner. The voting has been tied.";

        return winner1;
    }
}


