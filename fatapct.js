import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "./ChatMessage";
import { TrainingSelector } from "./TrainingSelector";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ConversationState = 
  | "welcome" 
  | "role-selection" 
  | "training-selection"
  | "strengths-challenges"
  | "quiz-ready"
  | "quiz-q1"
  | "quiz-q2" 
  | "quiz-q3"
  | "quiz-results"
  | "project-selection"
  | "team-match";

type UserRole = "student" | "collaborator" | "innovator" | "trainee" | "vendor" | "guide";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export function FatapChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "👋 Hello — welcome to **FATAP-CT: STEM, Smart Tech & Innovation Hub**.\nFATAPCT helps learners go from basics → hands-on skills → hackathons → marketplace.\n\n**Choose your role in Fatap:**\n\n• **Student** – Someone who wants to learn STEM or smart technologies\n• **Paired Collaborator** – Someone joining a project group or team\n• **Innovator/Coder** – Someone who wants to take part in hackathons, coding challenges, or competitions\n• **Computer Trainee** – Someone focusing on computer training (hardware, networking, or programming)\n• **Vendor** – Someone who lists and sells products in the marketplace\n• **Guide** – Someone who supports, reviews, and gives feedback on projects",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [state, setState] = useState<ConversationState>("role-selection");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isBot = true) => {
    setMessages(prev => [...prev, { text, isBot, timestamp: new Date() }]);
  };

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    addMessage(`I am a ${role}.`, false);
    
    const roleResponses = {
      student: "Great! Let's get started. What best describes your main interest today?",
      collaborator: "Welcome to the Collaboration Hub! You'll be matched with project teams based on your skills and interests.",
      innovator: "Excellent choice! Welcome to our Hackathon & Coding Challenges section. Ready to innovate and compete?",
      trainee: "Perfect! Welcome to our Computer Training Workshops. Let's build your technical skills step by step.",
      vendor: "Welcome to the Marketplace! Here you can list and sell your products to our community.",
      guide: "Thank you for being a Guide! Welcome to the Mentoring & Review Dashboard where you can support other learners."
    };
    
    setTimeout(() => {
      addMessage(roleResponses[role]);
      if (role === "student") {
        setState("training-selection");
      } else {
        setState("training-selection"); // For now, all paths lead to training selection
      }
    }, 1000);
  };

  const handleTrainingSelection = (trainingId: string) => {
    setSelectedTraining(trainingId);
    const trainingNames: Record<string, string> = {
      stem: "STEM foundations",
      computer: "Computer Training", 
      smarttech: "Smart Tech",
      algorithms: "Algorithms",
      marketplace: "Marketplace & entrepreneurship"
    };
    
    addMessage(trainingNames[trainingId], false);
    
    if (userRole === "student") {
      setTimeout(() => {
        addMessage(`Awesome — ${trainingNames[trainingId]} it is! Before we begin, tell me one strength and one challenge you face in this area.\n(Example: Strength — logic; Challenge — algebra)`);
        setState("strengths-challenges");
      }, 1000);
    }
  };

  const handleInput = (value: string) => {
    if (!value.trim()) return;
    
    addMessage(value, false);
    setInput("");
    
    switch (state) {
      case "strengths-challenges":
        setTimeout(() => {
          addMessage("Thank you — I'll use that to match you with peers and recommend micro-lessons.\nFirst, let's run a short baseline quiz (3 questions) to check your current level. Ready?");
          setState("quiz-ready");
        }, 1000);
        break;
        
      case "quiz-ready":
        if (value.toLowerCase().includes("yes")) {
          setTimeout(() => {
            addMessage("Mini Quiz — Question 1:\nWhat is the next number in the sequence: 2, 4, 8, 16, ?");
            setState("quiz-q1");
          }, 1000);
        }
        break;
        
      case "quiz-q1":
        setQuizAnswers([value]);
        setTimeout(() => {
          addMessage("Question 2:\nIf you have 3 projects and each takes 2 days to complete, and you can work on 2 projects simultaneously, how many days total?");
          setState("quiz-q2");
        }, 1000);
        break;
        
      case "quiz-q2":
        setQuizAnswers(prev => [...prev, value]);
        setTimeout(() => {
          addMessage("Question 3:\nWhat does SDG 9 focus on? (Industry, Innovation & Infrastructure / Education / Health)");
          setState("quiz-q3");
        }, 1000);
        break;
        
      case "quiz-q3":
        setQuizAnswers(prev => [...prev, value]);
        const score = Math.floor(Math.random() * 30) + 70; // Simulate good score
        setTimeout(() => {
          addMessage(`✅ Great — your answers are submitted.\n**Current mini-quiz score:** ${score}/100.\n\nSince your score is >= 70, you automatically qualify for a mid-level group project!\n\nWhich would you like to do now?\nA) Join the mid-level project\nB) Practice with micro-lessons\nC) Request a mentor check`);
          setState("quiz-results");
          toast({
            title: "Quiz Complete! 🎉",
            description: `You scored ${score}/100 - Excellent work!`,
          });
        }, 1500);
        break;
        
      case "quiz-results":
        if (value.toLowerCase().includes("a")) {
          setTimeout(() => {
            addMessage("Nice — I'm registering you for a mid-level project cohort.\nNext: tell me what kind of project you'd prefer (options: data puzzle, mini-robot build, mobile repair challenge, math modelling).\nI'll also auto-match you with 2 peers who complement your strengths.");
            setState("project-selection");
          }, 1000);
        }
        break;
        
      case "project-selection":
        setTimeout(() => {
          addMessage("✅ Match complete. Your team: Alex (design skills), Jordan (coding expertise).\nYour team has 7 days to submit a mini-project. Use the chat to request micro-lessons, test questions, or schedule a workshop.\n\n🎉 Ready to start building something amazing!");
          setState("team-match");
          toast({
            title: "Team Matched! 🤝",
            description: "You're now part of an innovative project team!",
          });
        }, 1500);
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background">
      {/* Header */}
      <div className="bg-gradient-hero p-4 text-center shadow-glow">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
          <h1 className="text-2xl font-bold text-white">FATAPCT</h1>
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <p className="text-white/90 text-sm">STEM, Smart Tech & Innovation Hub - SDG 9</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index}
            message={message.text}
            isBot={message.isBot}
          />
        ))}
        
        {/* Role Selection Buttons */}
        {state === "role-selection" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            <Button variant="hero" onClick={() => handleRoleSelection("student")}>
              Student 🎓
            </Button>
            <Button variant="training" onClick={() => handleRoleSelection("collaborator")}>
              Paired Collaborator 🤝
            </Button>
            <Button variant="quiz" onClick={() => handleRoleSelection("innovator")}>
              Innovator/Coder 💡
            </Button>
            <Button variant="success" onClick={() => handleRoleSelection("trainee")}>
              Computer Trainee 💻
            </Button>
            <Button variant="vendor" onClick={() => handleRoleSelection("vendor")}>
              Vendor 🛒
            </Button>
            <Button variant="default" onClick={() => handleRoleSelection("guide")}>
              Guide 🌟
            </Button>
          </div>
        )}
        
        {/* Training Selection */}
        {state === "training-selection" && (
          <TrainingSelector onSelect={handleTrainingSelection} />
        )}
        
        {/* Quiz Ready Buttons */}
        {state === "quiz-ready" && (
          <div className="flex gap-3 justify-center">
            <Button variant="quiz" onClick={() => handleInput("yes")}>
              Yes, I'm Ready! 🚀
            </Button>
            <Button variant="chat" onClick={() => handleInput("not yet")}>
              Not Yet
            </Button>
          </div>
        )}
        
        {/* Quiz Results Buttons */}
        {state === "quiz-results" && (
          <div className="flex gap-2 justify-center flex-wrap">
            <Button variant="success" onClick={() => handleInput("A")}>
              A) Join Mid-level Project 🎯
            </Button>
            <Button variant="training" onClick={() => handleInput("B")}>
              B) Practice Lessons 📚
            </Button>
            <Button variant="chat" onClick={() => handleInput("C")}>
              C) Mentor Check 👋
            </Button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {(state === "strengths-challenges" || 
        state === "quiz-q1" || 
        state === "quiz-q2" || 
        state === "quiz-q3" ||
        state === "project-selection" ||
        state === "team-match") && (
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              onKeyPress={(e) => e.key === "Enter" && handleInput(input)}
              className="flex-1"
            />
            <Button onClick={() => handleInput(input)} size="icon" variant="default">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
