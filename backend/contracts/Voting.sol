// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {

    address public owner;
    bool public votingEnded;
    uint public lastResetBlock;

    struct Candidate {
        string name;
        uint voteCount;
    }

    mapping(string => Candidate) public candidates;
    mapping(string => bool) private isCandidate;
    string[] public candidateList;
    address[] public Voters;
    event RestartPoll();
    event VoteCast(address indexed voter, string candidate);//indexed allows for off-chain backend tools to use the event
    event VotingEnded();
    event AddCandidates(string[] candidates);
    event RemoveCandidates();
    mapping(address => bool) public hasVoted;

    constructor() {
        owner = msg.sender;
        lastResetBlock = block.number;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    modifier votingActive() {
        require(!votingEnded, "Voting has ended.");
        _;
    }
    function addMultipleCandidates(uint _number, string[] memory names) public onlyOwner votingActive{
      require(_number >= 2,"There should be atleast 2 candidates in each poll"); 
      require(names.length == _number, "Names length does not match"); 
    for (uint i = 0; i < _number; i++) {
        require(!isCandidate[names[i]], "Duplicate candidate.");
        candidates[names[i]].name = names[i];
        isCandidate[names[i]] = true;
        candidateList.push(names[i]);
    }

    emit AddCandidates(names);
    }


    function vote(string memory _candidateName) public votingActive {
        require(!hasVoted[msg.sender], "You have already voted.");
        require(isCandidate[_candidateName], "Candidate does not exist.");

        candidates[_candidateName].voteCount += 1;
        hasVoted[msg.sender] = true;
        Voters.push(msg.sender);
        emit VoteCast(msg.sender,_candidateName);
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
        emit VotingEnded();
    }

    function resetVote() public onlyOwner {
        uint n = candidateList.length;
        for(uint i=n ; i > 0 ; i--)
        {
            string memory candidate = candidateList[i-1];
            delete candidates[candidate];
            candidateList.pop();
            isCandidate[candidate] = false;
        }
        emit RemoveCandidates();
        votingEnded = false;
        for(uint i=0 ; i < Voters.length ; i++)
        {
            hasVoted[Voters[i]] = false;
        }
        delete Voters;
        lastResetBlock = block.number;
        emit RestartPoll();
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

