# IBOps 5G RAN Optimization Agent

An AI-powered conversational agent for 5G Radio Access Network (RAN) optimization, built using Amazon Bedrock AgentCore and the Strands agent framework. This agent specializes in analyzing Py5cheSim simulation results and providing intelligent recommendations for network parameter optimization.

## 🎯 Overview

The IBOps Agent combines AI capabilities with 5G domain expertise to help network engineers:
- **Analyze** simulation results from IBOpsSim/Py5cheSim
- **Recommend** specific parameter optimizations
- **Answer** technical questions about 5G technology and 3GPP standards
- **Generate** ready-to-use YAML configurations

## 🏗️ Architecture

```
agent/
├── agent.py                    # Main AI agent with tools and logic
├── requirements.txt            # Python dependencies
├── .gitignore                 # Git exclusions
└── webapp/                    # React-based chat interface
    ├── src/
    │   ├── App.jsx            # Main chat component
    │   ├── App.css            # Styling (WhatsApp-inspired)
    │   ├── main.jsx           # React entry point
    │   └── index.css          # Global styles
    ├── index.html             # HTML template
    ├── package.json           # Node.js dependencies
    ├── vite.config.js         # Vite configuration
    └── bookmarklet.js         # Browser bookmarklet for quick access
```

## ✨ Features

### 🤖 AI Agent Capabilities

- **Amazon Nova Pro**: Primary AI model for intelligent responses
- **Claude 3.5 Haiku**: Conversation summarization for context management
- **Streaming Responses**: Real-time response generation
- **Multi-modal Input**: Text and image (screenshot) analysis
- **Observability**: Langfuse integration for tracing and monitoring

### 🔧 Specialized Tools

#### 1. `query_5g_knowledge_base`
Queries Amazon Bedrock Knowledge Base containing 3GPP specifications.

**Use for:**
- General 5G questions
- Standards and protocols
- Technical specifications
- Network slicing concepts

#### 2. `get_ran_parameters_guide`
Retrieves comprehensive 5G RAN parameters documentation from S3.

**Use for:**
- Parameter configuration guidance
- Understanding tunable parameters
- IBOps impact analysis
- Best practices

#### 3. `analyze_simulation_results`
Analyzes IBOpsSim performance metrics and recommends optimizations.

**Analyzes:**
- Throughput (DL/UL)
- Packet loss rates
- Signal quality (SINR)
- Resource utilization

**Recommends:**
- Bandwidth adjustments
- MIMO configuration changes
- Scheduler algorithm selection
- Traffic profile optimization

### 💬 Web Interface Features

- **WhatsApp-Style UI**: Familiar, intuitive chat interface
- **Real-time Streaming**: Live response updates with typing indicators
- **Screen Capture**: Built-in screenshot tool for dashboard analysis
- **Markdown Support**: Rich formatting for technical content
- **Dual Deployment**: Local development and AWS AgentCore production
- **Session Persistence**: Maintains conversation context
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

#### System Requirements
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **AWS CLI** configured with credentials

#### AWS Services Required
- **Amazon Bedrock** with model access:
  - `us.amazon.nova-pro-v1:0` (primary AI model)
  - `us.anthropic.claude-3-5-haiku-20241022-v1:0` (summarization)
- **Bedrock Knowledge Base** (optional, for 3GPP specifications)
- **S3 Bucket** with `5G_RAN_Parameters.md` uploaded
- **IAM Permissions** (see Security section)

#### Optional Services
- **Langfuse Account** for observability (currently hardcoded, see Security Notes)

### Installation

#### 1. Install Python Dependencies

```bash
cd Py5cheSim/agent
pip install -r requirements.txt
```

**Core Dependencies:**
- `bedrock-agentcore` - AWS Bedrock agent framework and runtime
- `strands-agents` - Conversation management and agent orchestration  
- `fastapi` - Web framework for API endpoints and CORS handling
- `boto3` - AWS SDK for Bedrock and S3 service calls
- `pyyaml` - YAML configuration parsing ⚠️ **Missing from requirements.txt**

**Additional Dependencies (auto-installed):**
- `langfuse` - Observability and conversation tracing
- `uvicorn` - ASGI server (comes with bedrock-agentcore)
- `pydantic` - Data validation (FastAPI dependency)
- `typing-extensions` - Type hints support

**⚠️ Missing Dependencies:**
The `requirements.txt` is missing `pyyaml` which is imported in the code. Add it manually:
```bash
pip install pyyaml
```

#### 3. Configure AWS Resources

**Option 1: Edit agent.py directly (Quick Start)**
```python
# Line 60: Update with your Knowledge Base ID
knowledge_base_id = "YOUR_KNOWLEDGE_BASE_ID"

# Lines 82-83: Update with your S3 bucket details
bucket_name = "your-bucket-name"
object_key = "path/to/5G_RAN_Parameters.md"
```

**Option 2: Use Environment Variables (Recommended)**
```bash
export BEDROCK_KNOWLEDGE_BASE_ID="your-knowledge-base-id"
export S3_BUCKET_NAME="your-bucket-name"
export S3_OBJECT_KEY="path/to/5G_RAN_Parameters.md"
export AWS_REGION="us-east-1"

# Optional: Langfuse configuration
export LANGFUSE_PK="your-langfuse-public-key"
export LANGFUSE_SK="your-langfuse-secret-key"
export LANGFUSE_HOST="https://us.cloud.langfuse.com"
```

**Required AWS Resources Setup:**
1. **Create S3 Bucket** and upload `5G_RAN_Parameters.md`
2. **Create Bedrock Knowledge Base** (optional) with 3GPP documents
3. **Request Model Access** in Bedrock console for Nova Pro and Claude Haiku
4. **Configure IAM permissions** (see Security section)

#### 2. Install Webapp Dependencies

```bash
cd webapp
npm install
```

**Frontend Dependencies:**
- `react@^18.2.0` - UI framework with modern hooks
- `react-dom@^18.2.0` - React DOM rendering

**Development Dependencies:**
- `@vitejs/plugin-react@^4.2.1` - Vite React plugin
- `vite@^5.0.8` - Fast build tool and dev server
- `@types/react@^18.2.43` - TypeScript definitions for React
- `@types/react-dom@^18.2.17` - TypeScript definitions for React DOM

**Runtime Dependencies (Browser APIs):**
- `crypto.randomUUID()` - Session ID generation
- `navigator.mediaDevices.getDisplayMedia()` - Screen capture
- `fetch()` - HTTP requests to agent backend
- `localStorage` - Settings persistence

### Running Locally

#### Start the Agent Backend

```bash
# From agent/ directory
python agent.py
```

The agent will start on `http://localhost:8080`

#### Start the Webapp Frontend

```bash
# From agent/webapp/ directory (in a new terminal)
npm run dev
```

The webapp will start on `http://localhost:5173`

#### Access the Interface

Open your browser to `http://localhost:5173`

## 📖 Usage Examples

### Example 1: Analyzing Simulation Results

**User Input:**
```
I ran a simulation with these results:
- DL Throughput: 475 Mbps
- UL Throughput: 509 Mbps
- DL Packet Loss: 99.1%
- UL Packet Loss: 96.8%
- DL SINR: 15.2 dB
- UL SINR: 15.2 dB

Current config:
- Bandwidth: 20 MHz
- Users: 50 DL, 50 UL
- Scheduler: Round Robin
- MIMO: SU-MIMO, 2 layers

Can you help optimize this?
```

**Agent Response:**
The agent will analyze the metrics, identify issues (high packet loss, low throughput), and provide specific recommendations like:
- Increase bandwidth to 40 MHz
- Switch to Proportional Fair scheduler
- Enable MU-MIMO with 4 layers
- Adjust DL/UL user ratio
- Provide ready-to-use YAML configuration

### Example 2: 5G Technical Questions

**User Input:**
```
What's the difference between Proportional Fair and Round Robin scheduling in 5G?
```

**Agent Response:**
Queries the knowledge base and provides detailed explanation with 3GPP references.

### Example 3: Parameter Configuration Help

**User Input:**
```
I need to configure a network for a stadium event with heavy uplink traffic. 
What parameters should I optimize?
```

**Agent Response:**
Provides specific recommendations for high-density, uplink-heavy scenarios.

### Example 4: Screenshot Analysis

1. Click the 📸 button in the webapp
2. Select your simulation dashboard window
3. The agent will analyze the screenshot and provide insights

## 🔧 Configuration

### Deployment Modes

#### Local Development (Default)
- Agent runs on `localhost:8080`
- No authentication required
- Best for development and testing

#### AWS AgentCore Deployment
- Deployed to Amazon Bedrock AgentCore
- Requires authentication token
- Production-ready with scaling

### Webapp Settings

Access settings by clicking the ⚙️ button in the webapp header:

**Local Mode:**
- No configuration needed
- Connects to `localhost:8080`

**Deployed Mode:**
- **Agent ARN**: Your AgentCore runtime ARN
  ```
  arn:aws:bedrock-agentcore:region:account:runtime/agent-id
  ```
- **Bearer Token**: Your ID token from AWS authentication

Settings are persisted in browser localStorage.

## 🛠️ Development

### Project Structure

**Backend (`agent.py`):**
- FastAPI application with CORS support
- Three specialized tools for 5G optimization
- Conversation management with summarization
- Streaming response generation
- Langfuse observability integration

**Frontend (`webapp/`):**
- React 18 with modern hooks
- Vite for fast development and building
- CSS with gradients and animations
- Real-time streaming with Server-Sent Events
- Screen capture API integration

### Key Technologies

**Backend Stack:**
- `bedrock-agentcore` - AWS Bedrock agent framework and ASGI application
- `strands-agents` - Agent conversation management with summarization
- `fastapi` - Web framework with automatic CORS middleware
- `boto3` - AWS SDK for Bedrock Agent Runtime and S3 client
- `langfuse` - Observability platform for conversation tracing
- `pyyaml` - YAML parsing (used in analyze_simulation_results tool)

**Frontend Stack:**
- `react` - Component-based UI framework with hooks
- `vite` - Fast build tool with HMR for development
- Native Browser APIs:
  - Screen Capture API for dashboard screenshots
  - Fetch API with streaming for real-time responses
  - LocalStorage API for settings persistence
  - Crypto API for session UUID generation

### Adding New Tools

To add a new tool to the agent:

1. Define the tool function with the `@tool` decorator:
```python
@tool
def your_new_tool(param: str) -> str:
    """
    Tool description for the AI model.
    
    Args:
        param: Parameter description
        
    Returns:
        Result description
    """
    # Implementation
    return result
```

2. Add the tool to the agent's tools list:
```python
agent = Agent(
    model="us.amazon.nova-pro-v1:0",
    tools=[query_5g_knowledge_base, get_ran_parameters_guide, 
           analyze_simulation_results, your_new_tool],
    # ...
)
```

### Customizing the UI

**Styling:**
- Edit `webapp/src/App.css` for component styles
- Edit `webapp/src/index.css` for global styles
- Color scheme uses gradient: `#667eea` to `#764ba2`

**Behavior:**
- Edit `webapp/src/App.jsx` for functionality
- Modify message rendering in `renderMarkdown()` function
- Adjust streaming logic in `sendMessage()` function

## 🌐 Deployment

### Deploy to AWS AgentCore

1. **Configure AgentCore:**
```bash
bedrock-agentcore init
```

2. **Deploy the agent:**
```bash
bedrock-agentcore deploy
```

3. **Update webapp settings:**
   - Copy the Agent ARN from deployment output
   - Generate an ID token from your authentication provider
   - Configure in webapp settings panel

### Deploy Webapp

**Option 1: Static Hosting (S3, CloudFront)**
```bash
cd webapp
npm run build
# Upload dist/ folder to S3 bucket
```

**Option 2: Container Deployment**
```bash
cd webapp
npm run build
# Serve dist/ folder with nginx or similar
```

## 🔐 Security Notes

### Credentials Management

**⚠️ Important:** The current `agent.py` contains hardcoded credentials that should be removed before production use:

```python
# Lines 18-20: Remove or use environment variables
os.environ["LANGFUSE_PK"] = "pk-lf-..."  # Remove this
os.environ["LANGFUSE_SK"] = "sk-lf-..."  # Remove this

# Lines 29-33: Remove hardcoded credentials
langfuse = Langfuse(
  secret_key="sk-lf-...",  # Use environment variable
  public_key="pk-lf-...",  # Use environment variable
  host="https://us.cloud.langfuse.com"
)
```

**Best Practice:**
```python
# Use environment variables instead
langfuse_pk = os.environ.get("LANGFUSE_PK")
langfuse_sk = os.environ.get("LANGFUSE_SK")

if langfuse_pk and langfuse_sk:
    langfuse = Langfuse(
        secret_key=langfuse_sk,
        public_key=langfuse_pk,
        host=os.environ.get("LANGFUSE_HOST", "https://us.cloud.langfuse.com")
    )
```

### AWS Permissions

The agent requires specific IAM permissions:

**Required Permissions:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock-agent-runtime:RetrieveAndGenerate"
            ],
            "Resource": "arn:aws:bedrock:*:*:knowledge-base/*"
        },
        {
            "Effect": "Allow", 
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*::foundation-model/us.amazon.nova-pro-v1:0",
                "arn:aws:bedrock:*::foundation-model/us.anthropic.claude-3-5-haiku-20241022-v1:0"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/path/to/5G_RAN_Parameters.md"
        }
    ]
}
```

**Service-Specific Requirements:**
- **Bedrock Knowledge Base**: Access to retrieve 3GPP specifications
- **Bedrock Models**: Invocation rights for Nova Pro and Claude Haiku
- **S3 Bucket**: Read access to RAN parameters documentation

## 🧪 Testing

### Test the Agent Locally

```bash
# Start the agent
python agent.py

# In another terminal, test with curl
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is network slicing in 5G?"}'
```

### Test the Webapp

```bash
cd webapp
npm run dev
# Open http://localhost:5173 and interact with the agent
```

## 📊 Integration with IBOpsSim

### Workflow

1. **Run Simulation:**
```bash
cd Py5cheSim/IBOpsSim
python3 simulate.py congested.yaml
```

2. **Copy Results:**
Note the output metrics (throughput, packet loss, SINR)

3. **Ask Agent:**
Paste results into the chat interface

4. **Apply Recommendations:**
Update your YAML configuration with suggested parameters

5. **Re-run Simulation:**
Verify performance improvements

### Expected Results

| Scenario | Agent Recommendation | Expected Improvement |
|----------|---------------------|---------------------|
| High packet loss | Switch to PF scheduler | 50-80% reduction |
| Low throughput | Increase bandwidth/MIMO | 2-4x improvement |
| Poor SINR | Optimize signal pattern | 3-5 dB improvement |
| Congestion | Load balancing + MU-MIMO | 200-300% capacity increase |

## 🐛 Troubleshooting

### Agent Won't Start

**Issue:** `ModuleNotFoundError: No module named 'yaml'`
```bash
# Solution: Install missing dependency
pip install pyyaml
# Or update requirements.txt to include pyyaml
```

**Issue:** `ModuleNotFoundError` for other packages
```bash
# Solution: Install all dependencies
pip install -r requirements.txt
```

**Issue:** `ImportError: cannot import name 'BedrockAgentCoreApp'`
```bash
# Solution: Ensure bedrock-agentcore is properly installed
pip install --upgrade bedrock-agentcore
```

**Issue:** AWS credentials not configured
```bash
# Solution: Configure AWS CLI
aws configure
# Or set environment variables:
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=us-east-1
```

**Issue:** Bedrock model access denied
```bash
# Solution: Request model access in AWS Console
# Go to Bedrock > Model access > Request access for:
# - Amazon Nova Pro
# - Anthropic Claude 3.5 Haiku
```

### Webapp Connection Issues

**Issue:** CORS errors in browser console
```python
# Solution: Verify CORS configuration in agent.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your domain
    # ...
)
```

**Issue:** Connection refused
```bash
# Solution: Ensure agent is running on port 8080
python agent.py
# Check output for "Uvicorn running on http://0.0.0.0:8080"
```

### Screen Capture Not Working

**Issue:** Browser blocks screen capture
- **Solution:** Use HTTPS or localhost (required by browser security)
- **Solution:** Grant screen capture permissions when prompted

## 📚 Additional Resources

- **Py5cheSim Documentation**: [Main README](../README.md)
- **IBOpsSim Guide**: [IBOpsSim README](../IBOpsSim/README.md)
- **5G RAN Parameters**: [Parameter Guide](../IBOpsSim/5G_RAN_Parameters.md)
- **Bedrock AgentCore**: [AWS Documentation](https://docs.aws.amazon.com/bedrock/)
- **Strands Framework**: [Strands Agents Documentation](https://github.com/awslabs/strands)

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional analysis tools
- Enhanced visualization
- More 5G optimization strategies
- UI/UX improvements
- Documentation enhancements

## 📄 License

This project follows the same license as Py5cheSim. See [LICENSE](../LICENSE.md) for details.

## 🙏 Acknowledgments

- Built on top of Py5cheSim by Gabriela Pereyra
- Uses Amazon Bedrock and AWS services
- Powered by Strands agent framework
- UI inspired by modern messaging applications

---

**Need Help?** Open an issue or refer to the main Py5cheSim documentation for simulation-specific questions.
