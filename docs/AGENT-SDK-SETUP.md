# Vislzr - Claude Agent SDK Implementation

## Overview

This document outlines the implementation structure for Vislzr using the Claude Agent SDK pattern, similar to the Performia project setup.

## Project Structure

```
vislzr-unified/
├── .aider/                    # Aider configuration
├── .github/                   # GitHub Actions CI/CD
│   └── workflows/
│       ├── test.yml
│       └── deploy.yml
├── agents/                    # AI Agent definitions
│   ├── architect/            # Architecture & design agent
│   ├── developer/            # Code implementation agent
│   ├── security/             # Security scanning agent
│   └── qa/                   # Testing & QA agent
├── docs/                     # Documentation
│   ├── PRD-MASTER.md         # Master product requirements (created)
│   ├── API.md               # API documentation
│   ├── SETUP.md             # Setup instructions
│   └── CONTRIBUTING.md      # Contribution guidelines
├── packages/                 # Monorepo packages
│   ├── api/                 # Backend API (FastAPI)
│   │   ├── src/
│   │   │   ├── agents/      # Agent endpoints
│   │   │   ├── core/        # Core business logic
│   │   │   ├── models/      # Database models
│   │   │   ├── routes/      # API routes
│   │   │   ├── services/    # Business services
│   │   │   └── utils/       # Utilities
│   │   ├── tests/
│   │   ├── pyproject.toml
│   │   └── README.md
│   ├── web/                 # Frontend React app
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── services/    # API clients
│   │   │   ├── stores/      # State management
│   │   │   ├── types/       # TypeScript types
│   │   │   └── utils/       # Utilities
│   │   ├── public/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── README.md
│   └── shared/              # Shared types & utilities
│       ├── src/
│       │   ├── types/       # Shared TypeScript types
│       │   └── schemas/     # Validation schemas
│       └── package.json
├── scripts/                  # Build & deployment scripts
│   ├── setup.sh
│   ├── dev.sh
│   ├── build.sh
│   ├── test.sh
│   └── deploy.sh
├── tests/                    # Integration tests
│   ├── e2e/
│   └── integration/
├── .env.example              # Environment variables template
├── .gitignore
├── docker-compose.yml        # Local development
├── Makefile                  # Common commands
├── package.json              # Root package.json (workspace)
├── pnpm-workspace.yaml      # PNPM workspace config
├── README.md                 # Project README
└── turbo.json               # Turborepo config
```

## Agent Definitions

### 1. Architect Agent
**Purpose**: Design system architecture, plan features, make technical decisions

**Responsibilities**:
- Review and update PRD
- Design system architecture
- Plan feature implementation
- Create technical specifications
- Review code architecture

**Context Files**:
- `docs/PRD-MASTER.md`
- `docs/ARCHITECTURE.md`
- `packages/*/README.md`

**Prompt Template**:
```
You are the Architecture Agent for Vislzr. Your role is to:
1. Ensure technical decisions align with the PRD
2. Design scalable, maintainable solutions
3. Review architecture for best practices
4. Plan implementation phases

Current focus: [TASK_DESCRIPTION]

Please provide:
- Technical approach
- Architecture diagrams (Mermaid)
- Implementation plan
- Risks and mitigation
```

### 2. Developer Agent
**Purpose**: Implement features, write clean code, follow best practices

**Responsibilities**:
- Implement features per specifications
- Write tests
- Refactor code
- Fix bugs
- Update documentation

**Context Files**:
- `docs/PRD-MASTER.md`
- Feature specs from Architect
- Existing codebase

**Prompt Template**:
```
You are the Developer Agent for Vislzr. Your role is to:
1. Implement features following the PRD and specs
2. Write clean, tested, documented code
3. Follow TypeScript/Python best practices
4. Ensure type safety

Current task: [FEATURE_NAME]

Specification:
[SPEC_CONTENT]

Please implement the feature with:
- Full implementation
- Unit tests
- Integration tests
- Documentation updates
```

### 3. Security Agent
**Purpose**: Scan for vulnerabilities, ensure secure coding practices

**Responsibilities**:
- Security audits
- Dependency vulnerability scanning
- Code security review
- Compliance checking
- Security documentation

**Context Files**:
- `docs/PRD-MASTER.md` (security requirements)
- All source code
- Dependencies

**Prompt Template**:
```
You are the Security Agent for Vislzr. Your role is to:
1. Identify security vulnerabilities
2. Review code for security best practices
3. Scan dependencies for known CVEs
4. Ensure compliance with security standards

Please perform a security audit focusing on:
- Authentication and authorization
- Data validation
- Dependency vulnerabilities
- API security
- Frontend security (XSS, CSRF)

Provide:
- Vulnerability report
- Severity ratings
- Remediation recommendations
- Updated security documentation
```

### 4. QA Agent
**Purpose**: Ensure quality, write tests, perform quality checks

**Responsibilities**:
- Write test plans
- Create automated tests
- Perform manual testing
- Generate test reports
- Quality metrics

**Context Files**:
- `docs/PRD-MASTER.md` (acceptance criteria)
- Feature specifications
- Existing tests

**Prompt Template**:
```
You are the QA Agent for Vislzr. Your role is to:
1. Create comprehensive test plans
2. Write automated tests (unit, integration, e2e)
3. Perform quality checks
4. Generate test reports

Current feature: [FEATURE_NAME]

Please provide:
- Test plan with coverage
- Test implementation
- Edge cases and error scenarios
- Quality metrics
```

## Development Workflow

### Phase 1: Planning & Architecture (Architect Agent)
```bash
# 1. Review PRD and create technical spec
aider --architect agents/architect/phase1-plan.md

# 2. Create architecture diagrams
aider --architect agents/architect/architecture.md

# 3. Break down into tasks
aider --architect agents/architect/tasks.md
```

### Phase 2: Implementation (Developer Agent)
```bash
# For each feature:
# 1. Review specification
aider --developer agents/developer/spec-[feature].md

# 2. Implement feature
aider --developer --file packages/web/src/components/[Feature].tsx

# 3. Write tests
aider --developer --file packages/web/src/components/[Feature].test.tsx

# 4. Update documentation
aider --developer --file docs/features/[feature].md
```

### Phase 3: Security Review (Security Agent)
```bash
# 1. Security audit
aider --security agents/security/audit-checklist.md

# 2. Dependency scan
aider --security agents/security/dependency-scan.md

# 3. Generate report
aider --security agents/security/report.md
```

### Phase 4: QA (QA Agent)
```bash
# 1. Create test plan
aider --qa agents/qa/test-plan-[feature].md

# 2. Implement tests
aider --qa --file tests/e2e/[feature].spec.ts

# 3. Run and report
aider --qa agents/qa/test-report.md
```

## Iteration Cycles

### Weekly Sprint Cycle
```
Monday:
  - Sprint planning (Architect Agent)
  - Task breakdown
  - Assign priorities

Tuesday-Thursday:
  - Feature implementation (Developer Agent)
  - Continuous testing (QA Agent)
  - Security reviews (Security Agent)

Friday:
  - Sprint review
  - Integration testing
  - Documentation updates
  - Sprint retrospective
```

### Daily Workflow
```
Morning:
  1. Review PRD for alignment
  2. Check task board
  3. Pull latest changes
  4. Run tests

During Development:
  1. Implement with agent assistance
  2. Write tests alongside code
  3. Run local tests frequently
  4. Commit often with clear messages

Evening:
  1. Push changes
  2. Review CI/CD results
  3. Update task status
  4. Plan next day
```

## Agent Interaction Patterns

### 1. Cascading Review
```
Architect → Developer → QA → Security
     ↓         ↓         ↓       ↓
   Spec    Implement   Test   Audit
```

### 2. Parallel Development
```
Developer Agent 1: Feature A
Developer Agent 2: Feature B
Developer Agent 3: Feature C
         ↓
    QA Agent: Test all features
         ↓
    Security Agent: Audit all changes
```

### 3. Feedback Loop
```
Developer → QA → (issues found) → Developer
                                       ↓
                                  (fixed) → QA
```

## Context Management

### Agent Context Files
Each agent maintains its own context:

```
agents/
├── architect/
│   ├── context.md           # Current architecture state
│   ├── decisions.md         # Design decisions log
│   └── roadmap.md          # Technical roadmap
├── developer/
│   ├── active-tasks.md     # Current work
│   ├── patterns.md         # Code patterns to follow
│   └── conventions.md      # Coding conventions
├── security/
│   ├── audit-log.md        # Security audit history
│   ├── vulnerabilities.md  # Known issues
│   └── compliance.md       # Compliance checklist
└── qa/
    ├── test-coverage.md    # Coverage reports
    ├── test-plans.md       # Test plans by feature
    └── bug-tracking.md     # Bug reports
```

### Shared Context
All agents reference:
- `docs/PRD-MASTER.md` - Single source of truth
- `docs/ARCHITECTURE.md` - System architecture
- `CHANGELOG.md` - Change history

## Setup Instructions

### 1. Initialize Project
```bash
# Clone and setup
git clone <repo-url> vislzr-unified
cd vislzr-unified

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your keys

# Initialize database
cd packages/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
```

### 2. Configure Agents
```bash
# Create agent configurations
mkdir -p .aider
cat > .aider/config.yml <<EOF
agents:
  architect:
    model: claude-sonnet-4-5
    context_files:
      - docs/PRD-MASTER.md
      - docs/ARCHITECTURE.md
    
  developer:
    model: claude-sonnet-4-5
    context_files:
      - docs/PRD-MASTER.md
      - packages/*/README.md
    
  security:
    model: claude-sonnet-4-5
    context_files:
      - docs/PRD-MASTER.md
      - docs/SECURITY.md
    
  qa:
    model: claude-sonnet-4-5
    context_files:
      - docs/PRD-MASTER.md
      - docs/TESTING.md
EOF
```

### 3. Start Development
```bash
# Terminal 1: Backend
cd packages/api
source .venv/bin/activate
uvicorn src.main:app --reload

# Terminal 2: Frontend
cd packages/web
pnpm dev

# Terminal 3: Agent workspace
aider --architect
```

## Best Practices

### 1. Always Start with PRD
Before any implementation, ensure alignment with `PRD-MASTER.md`:
```bash
aider --architect --read docs/PRD-MASTER.md
```

### 2. Small, Focused Commits
Each agent should make atomic commits:
```bash
git commit -m "feat(sibling-nodes): Add sibling node rendering

- Implement D3.js sibling node positioning
- Add fade-in/fade-out animations
- Context-aware positioning logic

Related to: Phase 2, Task 2.1"
```

### 3. Test-Driven Development
QA Agent creates tests first:
```bash
# 1. QA Agent writes test
aider --qa --file tests/e2e/sibling-nodes.spec.ts

# 2. Developer Agent implements
aider --developer --file packages/web/src/components/SiblingNodes.tsx

# 3. Tests pass
pnpm test
```

### 4. Continuous Security
Run security checks after each feature:
```bash
# After feature completion
aider --security agents/security/scan-latest.md
```

### 5. Documentation Alongside Code
Update docs in the same PR:
```bash
# Developer Agent updates docs
aider --developer \
  --file packages/web/src/components/Feature.tsx \
  --file docs/features/feature.md
```

## Migration from Existing Code

### Step 1: Consolidate Codebase
```bash
# Copy best parts from each implementation
cp -r Vislzr-main/apps/api packages/api
cp -r Vislzr-main/src packages/web/src

# Cherry-pick features from other versions
# - vislzrGem1: Gemini integration
# - contextual-interaction-ui: Sibling node concepts
```

### Step 2: Align with PRD
```bash
# Use Architect Agent to review alignment
aider --architect --read docs/PRD-MASTER.md \
                  --read packages/web/src/App.tsx \
                  --message "Review current implementation against PRD. What's missing?"
```

### Step 3: Remove Non-Aligned Features
```bash
# Architect Agent identifies what to remove
aider --architect agents/architect/cleanup-plan.md
```

### Step 4: Implement Missing Features
```bash
# Developer Agent implements gaps
# Follow the 6-phase roadmap from PRD
```

## Monitoring & Metrics

### Agent Performance Tracking
Track agent effectiveness:

```markdown
## Agent Metrics

### Architect Agent
- Specs created: 12
- Architecture diagrams: 5
- Design decisions: 23
- PRD alignment score: 95%

### Developer Agent
- Features implemented: 45
- Tests written: 156
- Test coverage: 87%
- Code review score: 4.5/5

### Security Agent
- Vulnerabilities found: 8
- False positives: 2
- High severity: 1
- All remediated: 7/8

### QA Agent
- Test plans created: 12
- Tests implemented: 234
- Bugs found: 31
- Critical bugs: 2
```

## Troubleshooting

### Agent Context Issues
If agent seems confused about project state:
```bash
# Refresh agent context
aider --architect --read docs/PRD-MASTER.md \
                  --read docs/ARCHITECTURE.md \
                  --message "Summarize current project state"
```

### Conflicting Agent Changes
```bash
# Use git to resolve
git merge --no-ff feature-branch

# If complex, use Architect Agent
aider --architect --message "Review merge conflicts and recommend resolution"
```

### Performance Issues
```bash
# Profile with agents
aider --developer --message "Profile the following code and suggest optimizations"
```

## Next Steps

1. **Review PRD**: Ensure all team members understand `PRD-MASTER.md`
2. **Setup Project**: Follow setup instructions above
3. **Start Phase 2**: Begin sibling nodes implementation
4. **Iterate**: Follow weekly sprint cycle

---

**Remember**: The PRD is the north star. Every decision, every line of code should align with it. When in doubt, consult the PRD with your agent:

```bash
aider --architect --read docs/PRD-MASTER.md \
                  --message "Does [FEATURE] align with our vision?"
```
