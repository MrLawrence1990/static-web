import { Layout, Menu, Upload, Icon, Form, Button, Input, Modal, Avatar, Tabs, Select,Checkbox  } from 'antd';
import React from 'react';
import utils from './utils';
import reqwest from 'reqwest';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import './App.css';
import './editor.css';

const { Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

export default class extends React.Component {

  src = "/project/";

  state = {
    collapsed: false,
    visible: false,
    menu: [],
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    src: '/project/welcome',
    visibleAdd: false,
    addType: '1',
    fileList: [],
    editorState: EditorState.createEmpty(),
  };

  onEditorStateChange(editorState) {
    this.setState({
      editorState,
    });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  dologin = () => {
    let that = this;
    utils.request({
      api: '/login',
      params: {
        user: this.state.name,
        password: utils.md5(this.state.password)
      },
      beforeRequest() {
        that.setState({
          logining: true,
        })
      },
      afterRequest() {
        that.setState({
          logining: false,
        })
      },
      success(data) {
        localStorage.setItem('user', JSON.stringify(data))
        that.setState({
          user: data,
          visible: false
        })
      }
    })
  }

  logout() {
    let that = this;
    utils.request({
      api: '/logout',
      afterRequest() {
        localStorage.clear()
        that.setState({
          user: null,
        })
      },
    })
  }

  onCollapse = (collapsed) => {
    console.log(collapsed);
    this.setState({ collapsed });
  }


  componentWillMount() {
    this.init();
  }

  init() {
    let that = this;
    utils.request({
      api: '/project',
      method: 'GET',
      success(data) {
        that.setState({
          menu: data
        })
      }
    })
  }

  addTypeChange(key) {
    this.setState({
      addType: key
    })
  }
  calcDisAbled() {
    if (this.state.addType === '1') {
      return !this.state.projectName
    }

    return !this.state.version || !this.state.addTo || !this.state.fileList || this.state.fileList.length < 1
  }

  calcDisAbledDoc() {
    return !this.state.documentName || !this.state.addTo || !draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
  }

  doAdd() {
    let that = this;
    switch (this.state.addType) {
      case '1'://添加项目
        utils.request({
          api: '/project/add',
          params: {
            projectName: this.state.projectName
          },
          beforeRequest() {
            that.setState({
              addLoading: true,
            })
          },
          afterRequest() {
            that.setState({
              addLoading: false,
            })
          },
          sessionError() {
            that.setState({
              visibleAdd: false,
              visible: true
            })
          },
          success() {
            that.setState({
              visibleAdd: false
            })
            that.init();
          }
        })
        break;
      case '2':
        this.handleUpload();
    }
  }

  handleUpload = () => {
    const { fileList } = this.state;
    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('addTo', this.state.addTo)
    formData.append('version', this.state.version)
    formData.append('isGBK', this.state.isGBK?1:0)
    this.setState({
      addLoading: true,
    });

    // You can use any AJAX library you like
    reqwest({
      url: utils.API + '/upload',
      method: 'post',
      processData: false,
      withCredentials: true,
      data: formData,
      success: (response) => {
        response = JSON.parse(response.response);
        if (response.status === 403) {
          this.setState({
            visibleAdd: false, visible: true, addLoading: false
          })
        } else {
          if (response.status === 200) {
            this.setState({
              fileList: [],
              addLoading: false,
              visibleAdd: false
            });
            this.init()
          }
        }
      },
      error: () => {
        this.setState({
          addLoading: false,
        });
      },
    });
  }

  share() {
    this.setState({
      sharevisible: true
    })
  }

  removeProject(project) {
    let password = '';
    let that = this;
    Modal.confirm({
      title: 'Sure remove this project',
      content: <Input type="password" placeholder="password" onChange={(e) => { password = e.target.value }} />,
      okText: 'Ok',
      cancelText: 'Cancel',
      onOk: () => {
        return utils.request({
          api: '/project/remove',
          params: {
            projectName: project,
            password: utils.md5(password)
          },
          success() {
            that.init();
          },
          sessionError() {
            that.setState({
              visibleAdd: false,
              visible: true
            })
          }
        })
      }
    });
  }

  onImgUploaded(file) {
    let that = this;
    const formData = new FormData();
    formData.append('img', file);
    return new Promise((resolve, reject) => {
      reqwest({
        url: utils.API + '/upload/img',
        method: 'post',
        processData: false,
        withCredentials: true,
        data: formData
      }).then(function (response) {
        return JSON.parse(response.response);
      }).then(function (resp) {
        if (resp.status === 403) {
          that.setState({
            addDocumentVisible: false,
            visible: true
          })
          reject()
        } else {
          if (resp.status === 200) {
            resolve({ data: { link: utils.IMG_API + resp.data } })
          }
        }
      }, function (err, msg) {
        reject(err)
      });
    })
  }

  render() {
    let that = this;
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          theme="light"
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <div className="logo" />
          <Menu mode="inline">
            {this.state.menu.map((menu, index) => {
              return (<SubMenu
                key={index}
                title={<span><Icon type="project" /><span>{menu.name}</span></span>}
              >
                {menu.project.map((smenu, i) => {
                  let a = <div style={{ position: 'relative' }}>
                    <span>{smenu}</span>
                    {that.state.user ? <div style={{ position: 'absolute', right: '12px', display: 'inline-block' }} >
                      <Icon className="project-remove" onClick={(e) => { e.stopPropagation(); this.removeProject(menu.name+'/'+smenu) }} style={{ color: '#ff0000' }} type="delete" />
                    </div> : null}
                  </div>
                  return <Menu.Item key={index + '-' + i} onClick={() => this.setState({ src: this.src + menu.name + '/' + smenu })}>{a}</Menu.Item>
                })}
              </SubMenu>)
            })}

          </Menu>
        </Sider>
        <Layout className="App">
          <div className="header">
            {this.state.user ?
              <div style={{ display: 'inline-block' }}>
                <Button type="primary" style={{ marginLeft: '12px' }} onClick={() => this.setState({ visibleAdd: true, addTo: '', version: '', fileList: [], projectName: '' })}>
                  <Icon type="folder-add" />New Project
              </Button>
                <Button type="primary" onClick={() => this.setState({ addDocumentVisible: true, addTo: '', version: '', fileList: [], projectName: '', documentName: '' })}>
                  <Icon type="file-word" />New Document
              </Button>
                <Button type="default" onClick={this.share.bind(this)}>
                  <Icon type="share-alt" />Share
              </Button>
              </div> :
              <div style={{ display: 'inline-block' }}>
                <Button style={{ marginLeft: '12px' }} type="default" onClick={this.share.bind(this)}>
                  <Icon type="share-alt" />Share
              </Button>
              </div>}
            {this.state.user ?
              <span style={{ marginRight: '24px', height: '60px', display: 'inline-block', float: 'right' }}>
                <Avatar style={{ backgroundColor: '#87d068', marginRight: '12px' }} icon="user" />
                <span style={{ color: '#333' }}>Hello！{this.state.user.username}</span>
                <a href="javascript:void(0)" style={{ marginLeft: '12px' }} onClick={() => this.logout.bind(this)()}>Logout</a></span> : <Button type="primary" onClick={() => this.setState({ visible: true })}>Login</Button>
            }
          </div>
          <Content style={{ height: '100%', position: 'relative' }}>
            {/* <div className="side-ctrl">
              <div style={{ display: 'table-cell', textAlign: 'center', verticalAlign: 'middle' }}>
                <Icon style={{ fontSize: '24px' }} type="share-alt" />
              </div>
            </div> */}
            <iframe src={this.state.src} title="Project"></iframe>
          </Content>
        </Layout>
        <Modal
          title="Login"
          visible={this.state.visible}
          onOk={this.dologin}
          onCancel={() => this.setState({ visible: false })}
          okText="Login"
          cancelText="Cancel"
        >
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem>
              <Input maxLength={20} prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} onChange={(e) => this.setState({ name: e.target.value })} placeholder="user name" />
            </FormItem>
            <FormItem>
              <Input maxLength={16} prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} onChange={(e) => this.setState({ password: e.target.value })} type="password" placeholder="password" />
            </FormItem>
          </Form>
        </Modal>

        <Modal
          visible={this.state.sharevisible}
          title="分享"
          onOk={() => {
            document.getElementById('share-link').select();
            try {
              var successful = document.execCommand('copy');
              var msg = successful ? 'Succeed!' : 'not support';
              alert(msg);
              this.setState({
                sharevisible: false
              })
            } catch (err) {
              alert('not support');
            }
          }}
          okText="Copy Link"
          cancelText="Cancel"
          onCancel={() => this.setState({ sharevisible: false })}
        >
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem>
              <Input id="share-link" value={window.location.origin+this.state.src} prefix={<Icon type="link" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="share" />
            </FormItem>
          </Form>
        </Modal>

        <Modal
          visible={this.state.addDocumentVisible}
          title={
            <div>
              <span style={{ fontSize: '14px' }}>Add to：</span>
              <Select
                onChange={(value) => { this.setState({ addTo: value }) }}
                className="prefix-icon"
                value={this.state.addTo}
                suffixIcon={<Icon type="project"
                  style={{ color: 'rgba(0,0,0,.25)' }} />}
                style={{ width: '300px', marginRight: '12px' }} placeholder="chose the target group">
                {this.state.menu.map((menu, key) => {
                  return <Option key={key} value={menu.name}>{menu.name}</Option>
                })}
              </Select>
              <span style={{ fontSize: '14px' }}>Document：</span>
              <Input
                value={this.state.documentName}
                style={{ width: '300px' }}
                maxLength={20} prefix={<Icon type="file-unknown" style={{ color: 'rgba(0,0,0,.25)' }} />}
                onChange={(e) => this.setState({ documentName: e.target.value })} placeholder="document title" />
            </div>
          }
          onOk={() => {
            let that = this;
            utils.request({
              api: '/doc/add',
              params: {
                projectName: this.state.projectName,
                addTo: this.state.addTo,
                documentName: this.state.documentName,
                content: draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
              },
              beforeRequest() {
                that.setState({
                  addDocLoading: true,
                })
              },
              afterRequest() {
                that.setState({
                  addDocLoading: false,
                })
              },
              sessionError() {
                that.setState({
                  addDocumentVisible: false,
                  visible: true
                })
              },
              success() {
                that.setState({
                  addDocumentVisible: false
                })
                that.init();
              }
            })
          }}
          width={900}
          okText="Save"
          cancelText="Cancel"
          okButtonProps={{ disabled: this.calcDisAbledDoc(), loading: this.state.addDocLoading }}
          onCancel={() => this.setState({ addDocumentVisible: false })}
        >
          <div>
            <Editor
              localization={{
                locale: 'zh',
              }}
              toolbar={{
                options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
                image: {
                  className: undefined,
                  component: undefined,
                  popupClassName: undefined,
                  urlEnabled: true,
                  uploadEnabled: true,
                  alignmentEnabled: true,
                  uploadCallback: this.onImgUploaded.bind(this),
                  previewImage: true,
                  inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                  alt: { present: false, mandatory: false },
                  defaultSize: {
                    height: 'auto',
                    width: 'auto',
                  },
                },
              }}
              editorState={this.state.editorState}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              onEditorStateChange={this.onEditorStateChange.bind(this)}
            />
          </div>
        </Modal>

        <Modal
          visible={this.state.visibleAdd}
          onOk={this.doAdd.bind(this)}
          onCancel={() => this.setState({ visibleAdd: false })}
          okText="Add"
          cancelText="Cancel"
          okButtonProps={{ disabled: this.calcDisAbled(), loading: this.state.addLoading }}
        >
          <Tabs defaultActiveKey="1" onChange={this.addTypeChange.bind(this)}>
            <TabPane tab="Add Group" key="1">
              <div style={{ padding: '24px' }}>
                <Input
                  value={this.state.projectName}
                  maxLength={20} prefix={<Icon type="project" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  onChange={(e) => this.setState({ projectName: e.target.value })} placeholder="input group name" />
              </div>
            </TabPane>
            <TabPane tab="Add Project" key="2">
              <div style={{ padding: '24px' }}>
                <Select
                  onChange={(value) => { this.setState({ addTo: value }) }}
                  className="prefix-icon"
                  value={this.state.addTo}
                  suffixIcon={<Icon type="project"
                    style={{ color: 'rgba(0,0,0,.25)' }} />}
                  style={{ width: '100%', marginBottom: '12px' }} placeholder="chose the target group">
                  {this.state.menu.map((menu, key) => {
                    return <Option key={key} value={menu.name}>{menu.name}</Option>
                  })}
                </Select>
                <Input
                  value={this.state.version}
                  maxLength={20} prefix={<Icon type="file-unknown" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  onChange={(e) => this.setState({ version: e.target.value.replace(/\s+/g, '').replace(/([^\u0000-\u00FF])/g, '') })} placeholder="version" />
                <div style={{margin:'12px 0'}}>
                  <Checkbox checked={this.state.isGBK} onChange={(e)=>this.setState({isGBK:e.target.checked})}>GBK</Checkbox>
                </div>
                <div style={{ margin: '12px 0', textAlign: 'right' }}>
                  <Upload
                    action={utils.API + '/upload'}
                    onChange={this.handleChange}
                    multiple={false}
                    accept='.zip,.rar'
                    withCredentials={true}
                    onRemove={(file) => {
                      this.setState(({ fileList }) => {
                        const index = fileList.indexOf(file);
                        const newFileList = fileList.slice();
                        newFileList.splice(index, 1);
                        return {
                          fileList: newFileList,
                        };
                      });
                    }}
                    beforeUpload={(file) => {
                      this.setState(({ fileList }) => ({
                        fileList: [...fileList, file],
                      }));
                      return false;
                    }}
                    fileList={this.state.fileList}>
                    {this.state.fileList.length > 0 ? null : <Button><Icon type="upload" /> Upload</Button>}
                  </Upload>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </Modal>
      </Layout>
    );
  }
}