---
title: Query Processing Flow
---

%%{init: { 'flowchart': { 'curve': 'basis', 'htmlLabels': true }} }%%
flowchart TD
    %% User Input and Query Processing
    A[User] -->|Input| B[Query Interface]
    B --> C{Query Type?}
    
    %% Query Type Branching
    C -->|Natural Language| D[Language Parser]
    C -->|Direct Command| E[Syntax Validator]
    
    %% Query Processing
    D --> F[Intent Recognition - Knowledge Base]
    E --> G[Command Schema Check]
    
    F --> H[Query Generator]
    G --> H
    
    %% Authentication
    H --> I[Auth Module - User Permissions]
    
    I --> J{Valid?}
    J -->|Yes| K[Query Engine]
    J -->|No| L[Error: Access Denied]
    
    %% Data Source Selection
    K --> M{Data Source?}
    M -->|Local DB| N[[Database Adapter]]
    M -->|External API| O[API Gateway]
    
    %% Cache Processing
    N --> P[Cache Check]
    P --> Q{Cache Hit?}
    Q -->|Yes| R[Return Cached Data]
    Q -->|No| S[Execute DB Query]
    
    %% API Processing
    O --> T[Rate Limiter]
    T --> U[API Request]
    U --> V{Response OK?}
    V -->|Yes| W[Parse API Data]
    V -->|No| X[Retry Mechanism]
    
    %% Data Processing
    S --> Y[Data Transformer]
    W --> Y
    
    %% Result Processing
    Y --> Z[Data Filter - User Rules]
    Z --> AA[Result Formatter - JSON/HTML/Text]
    
    AA --> AB[Output Builder]
    R --> AB
    
    %% Output and Feedback
    AB --> AC[UI Renderer or CLI Display]
    
    AC --> AD[User Feedback]
    AD -->|Success| AE[Log Metrics]
    AD -->|Failure| AF[Error Reporter]
    
    %% Analytics and Monitoring
    AE --> AG[Analytics Dashboard]
    AF --> AG
    AG --> AH[System Health Monitor]
    
    %% Styling with black text
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px,color:#000
    classDef decision fill:#f5d6fe,stroke:#333,stroke-width:1px,color:#000
    classDef input fill:#d4e5f9,stroke:#333,stroke-width:1px,color:#000
    classDef process fill:#ddf1d4,stroke:#333,stroke-width:1px,color:#000
    classDef output fill:#ffe9cc,stroke:#333,stroke-width:1px,color:#000
    
    class A,B input
    class C,J,M,Q,V decision
    class K,N,O,S,T,U,W,X,Y process
    class R,AA,AB,AC output
    class AG,AH output

%% Link styling
linkStyle default stroke:#333,stroke-width:2px,color:#000
