from bedrock_agentcore import BedrockAgentCoreApp
from strands.agent.conversation_manager import SummarizingConversationManager
from strands import Agent
from strands.tools import tool
from fastapi.middleware.cors import CORSMiddleware
import boto3
import json
from typing import Dict, Any
from langfuse import Langfuse
import os
import base64

app = BedrockAgentCoreApp()

# Add CORS middleware for local webapp usage
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize AWS clients
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')
s3_client = boto3.client('s3')

os.environ["LANGFUSE_HOST"] = "https://us.cloud.langfuse.com"
os.environ["LANGFUSE_PK"] = "pk-lf-ecea5e02-7be7-4b1a-b80b-c20c4618124d"
os.environ["LANGFUSE_SK"] = "sk-lf-df0488c5-931e-4d80-a871-23d82dd979d0"

langfuse_pk = os.environ.get("LANGFUSE_PK")
langfuse_sk = os.environ.get("LANGFUSE_SK")
# Set up endpoint
otel_endpoint = str(os.environ.get("LANGFUSE_HOST", "")) + "/api/public/otel/v1/traces"
# Create authentication token:
auth_token = base64.b64encode(f"{langfuse_pk}:{langfuse_sk}".encode()).decode()
os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = otel_endpoint
os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = f"Authorization=Basic {auth_token}"


langfuse = Langfuse(
  secret_key="sk-lf-df0488c5-931e-4d80-a871-23d82dd979d0",
  public_key="pk-lf-ecea5e02-7be7-4b1a-b80b-c20c4618124d",
  host="https://us.cloud.langfuse.com"
)
# tool to query Bedrock Knowledge Base for 3GPP specs
@tool
def query_5g_knowledge_base(query: str) -> str:
    """
    Query the Bedrock Knowledge Base containing 3GPP 5G specifications and standards.
    Use this for general 5G questions, standards, protocols, and technical specifications.
    
    Args:
        query: The question or topic to search for in the 5G knowledge base
        
    Returns:
        Relevant information from 3GPP specifications and 5G standards
    """
    try:
        # Replace with your actual Knowledge Base ID
        knowledge_base_id = "SRB3GNRNJ7"  
        
        response = bedrock_agent_runtime.retrieve_and_generate(
            input={
                'text': query
            },
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': knowledge_base_id,
                    'modelArn': 'us.anthropic.claude-3-5-haiku-20241022-v1:0'
                }
            }
        )
        
        return response['output']['text']
    except Exception as e:
        return f"Error querying knowledge base: {str(e)}"

# tool to read 5G RAN parameters from S3
@tool
def get_ran_parameters_guide() -> str:
    """
    Retrieve the comprehensive 5G RAN parameters configuration guide.
    This contains detailed information about all configurable parameters in the simulator
    including bandwidth, MIMO, scheduling algorithms, traffic profiles, and their IBOps impact.
    
    Returns:
        Complete 5G RAN parameters documentation
    """
    try:
        # Replace with your actual S3 bucket and key
        bucket_name = "aka-demo-s3"  
        object_key = "bedrock/demos/5G_RAN_Parameters.md"  
        
        response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
        content = response['Body'].read().decode('utf-8')
        
        return content
    except Exception as e:
        return f"Error reading RAN parameters guide: {str(e)}"

# tool to analyze simulation results and recommend optimizations
@tool
def analyze_simulation_results(
    scenario_name: str,
    dl_throughput: float,
    ul_throughput: float,
    dl_packet_loss: float,
    ul_packet_loss: float,
    dl_sinr: float,
    ul_sinr: float,
    current_config: Dict[str, Any]
) -> str:
    """
    Analyze 5G RAN simulation results and recommend parameter optimizations.
    
    Args:
        scenario_name: Name of the simulation scenario
        dl_throughput: Downlink throughput in Mbps
        ul_throughput: Uplink throughput in Mbps  
        dl_packet_loss: Downlink packet loss percentage
        ul_packet_loss: Uplink packet loss percentage
        dl_sinr: Downlink SINR in dB
        ul_sinr: Uplink SINR in dB
        current_config: Current YAML configuration as dictionary
        
    Returns:
        Analysis and recommended parameter changes
    """
    
    analysis = f"""
## 📊 Simulation Results Analysis: {scenario_name}

### Current Performance:
- **DL Throughput**: {dl_throughput:.2f} Mbps
- **UL Throughput**: {ul_throughput:.2f} Mbps  
- **DL Packet Loss**: {dl_packet_loss:.2f}%
- **UL Packet Loss**: {ul_packet_loss:.2f}%
- **DL SINR**: {dl_sinr:.2f} dB
- **UL SINR**: {ul_sinr:.2f} dB

### Performance Assessment:
"""
    
    recommendations = []
    
    # Analyze throughput
    if dl_throughput < 500:
        recommendations.append("🔧 **Low DL Throughput**: Increase bandwidth or switch to MU-MIMO")
    if ul_throughput < 500:
        recommendations.append("🔧 **Low UL Throughput**: Optimize UL/DL user ratio or increase MIMO layers")
    
    # Analyze packet loss
    if dl_packet_loss > 10:
        recommendations.append("📉 **High DL Packet Loss**: Increase buffer size or use Proportional Fair scheduler")
    if ul_packet_loss > 10:
        recommendations.append("📉 **High UL Packet Loss**: Reduce packet arrival rates or increase bandwidth")
    
    # Analyze signal quality
    if dl_sinr < 20:
        recommendations.append("📡 **Poor DL Signal Quality**: Optimize SINR pattern or reduce interference")
    if ul_sinr < 20:
        recommendations.append("📡 **Poor UL Signal Quality**: Improve signal management configuration")
    
    # Generate specific parameter recommendations
    param_changes = {}
    
    # Bandwidth optimization
    current_bw = current_config.get('network', {}).get('bandwidth', 20)
    if dl_throughput < 1000 or ul_throughput < 1000:
        param_changes['network.bandwidth'] = min(current_bw * 2, 100)
        
    # Scheduler optimization  
    current_scheduler = current_config.get('network', {}).get('inter_scheduler', 'RR')
    if dl_packet_loss > 5 or ul_packet_loss > 5:
        if current_scheduler == 'RR':
            param_changes['network.inter_scheduler'] = 'PF11'
            param_changes['network.intra_scheduler'] = 'PF11'
    
    # MIMO optimization
    current_mimo = current_config.get('network', {}).get('mimo_mode', 'SU')
    current_layers = current_config.get('network', {}).get('mimo_layers', 2)
    if dl_throughput < 2000 and current_mimo == 'SU':
        param_changes['network.mimo_mode'] = 'MU'
        param_changes['network.mimo_layers'] = min(current_layers * 2, 8)
    
    # Traffic optimization
    dl_users = current_config.get('traffic', {}).get('dl_users', 5)
    ul_users = current_config.get('traffic', {}).get('ul_users', 5)
    if ul_throughput < dl_throughput * 0.5:  # UL much lower than DL
        param_changes['traffic.dl_users'] = max(dl_users - 10, 5)
        param_changes['traffic.ul_users'] = ul_users + 10
    
    if recommendations:
        analysis += "\n### 🚨 Issues Identified:\n" + "\n".join(f"- {rec}" for rec in recommendations)
    else:
        analysis += "\n✅ **Performance looks good!** No major issues detected."
    
    if param_changes:
        analysis += "\n\n### 🎯 Recommended Parameter Changes:\n"
        for param, value in param_changes.items():
            analysis += f"- **{param}**: {value}\n"
        
        analysis += "\n### 📝 YAML Configuration Updates:\n```yaml\n"
        for param, value in param_changes.items():
            sections = param.split('.')
            if len(sections) == 2:
                analysis += f"{sections[0]}:\n  {sections[1]}: {value}\n"
        analysis += "```"
    else:
        analysis += "\n\n✅ **No parameter changes recommended** - current configuration appears optimal."
    
    return analysis

custom_summarization_agent = Agent(model="us.anthropic.claude-3-5-haiku-20241022-v1:0")

conversation_manager = SummarizingConversationManager(
    summary_ratio=0.4,
    preserve_recent_messages=4,
    summarization_agent=custom_summarization_agent
)

agent = Agent(
    model="us.amazon.nova-pro-v1:0",
    conversation_manager=conversation_manager,
    tools=[query_5g_knowledge_base, get_ran_parameters_guide, analyze_simulation_results],
    system_prompt="""You are an expert 5G RAN optimization agent specializing in IBOps (Intelligence-Based Operations). 

Your role is to:
1. Help users optimize 5G RAN performance by analyzing simulation results
2. Recommend specific parameter changes for YAML configurations  
3. Answer questions about 5G technology using 3GPP specifications
4. Provide guidance on network slicing, MIMO, scheduling algorithms, and QoS optimization

When analyzing simulation results:
- Focus on throughput, packet loss, and signal quality metrics
- Provide specific, actionable parameter recommendations
- Explain the reasoning behind each recommendation
- Format recommendations as YAML configuration changes

When answering 5G questions:
- Use the knowledge base for 3GPP specifications and standards
- Reference the RAN parameters guide for simulator-specific configurations. ONLY suggest tunable parameters in the 5G RAN parameters guide for the user to tune which include: bandwidth, MIMO, scheduler
- Provide technical depth appropriate for network engineers

Always be concise, practical, and focused on improving network performance."""
)

@app.entrypoint
async def invoke(payload):
    """IBOps 5G RAN Optimization Agent"""
    print("==================INVOKING IBOPS AGENT===================")
    
    user_message = payload.get("prompt", "Hello! I'm your 5G RAN optimization expert. How can I help you improve your network performance?")
    input_message_list = [
        {"text": user_message}
    ]
    if "image" in payload:
        # Remove data:image/png;base64, prefix if present
        image_data = payload["image"]
        if image_data.startswith("data:image"):
            image_data = image_data.split(",")[1]
        
        decoded_bytes = base64.b64decode(image_data)
        image_block = {
            "image": {
                "format": "png",
                "source": {
                    "bytes": decoded_bytes
                }
            }
        }
        input_message_list.append(image_block)
    
    stream = agent.stream_async(input_message_list)
    async for event in stream:
        if "data" in event:
            yield event["data"]

if __name__ == "__main__":
    app.run()
